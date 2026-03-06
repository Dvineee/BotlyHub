import asyncio
import logging
import datetime
from datetime import timezone

from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import CommandStart
from aiogram.types import ChatMemberUpdated, CallbackQuery
from aiogram.utils.keyboard import InlineKeyboardBuilder

from supabase import create_client, Client

# --- CONFIG ---
# Kullanıcı tarafından sağlanan güncel bilgiler
BOT_TOKEN = "8468942589:AAEmh541e7JYCd0iNsyi9iyyN1O9e8njJFc"
SUPABASE_URL = "https://ybnxfwqrduuinzgnbymc.supabase.co"
SUPABASE_KEY = "sb_secret_jDxdXsQ-wb4RelA0hOfNkg_LTINMqJ5"
MINI_APP_URL = "https://botlyhub.vercel.app/#/"
MARKETPLACE_BOT_ID = "BOT-82202-C5G"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

bot = Bot(BOT_TOKEN)
dp = Dispatcher()
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

UTCNOW = lambda: datetime.datetime.now(timezone.utc).isoformat()

# =====================================================
# 🔥 1. REKLAM DAĞITIM MOTORU (KANAL LOCK SİSTEMİ)
# =====================================================
async def ad_dispatcher_task():
    while True:
        try:
            # 1. Aktif reklamları çek
            promos = supabase.table("promotions") \
                .select("*") \
                .eq("status", "sending") \
                .execute().data or []

            if not promos:
                logger.info("📭 Aktif reklam yok")
                await asyncio.sleep(20)
                continue

            logger.info(f"📢 {len(promos)} adet aktif reklam bulundu")

            # 2. Reklam alabilecek kanalları çek
            # Not: archived=False yerine archived is not True kontrolü daha güvenli (NULL durumları için)
            channels_data = supabase.table("channels") \
                .select("*") \
                .eq("revenue_enabled", True) \
                .execute().data or []
            
            # Filtreleme: archived True olmayanları al (False veya None/Null olanlar)
            channels = [c for c in channels_data if not c.get("archived")]

            logger.info(f"📡 Reklam alabilecek {len(channels)} kanal var")

            if not channels:
                logger.warning("⚠️ Reklam var ama yayınlanacak kanal bulunamadı (Tüm kanallar pasif veya arşivlenmiş olabilir)")
                await asyncio.sleep(30)
                continue

            for promo in promos:
                logger.info(f"🚀 Reklam başlatıldı | ID={promo['id']} | {promo['title']}")

                processed = set(promo.get("processed_channels") or [])
                reach = int(promo.get("total_reach") or 0)
                
                # Bu reklam için bu döngüde yeni bir işlem yapıldı mı?
                newly_processed_count = 0

                for ch in channels:
                    tg_id = ch["telegram_id"]

                    # 🔒 KANAL BOT KİLİDİ (Başka bir bot bu kanalı sahiplenmiş mi?)
                    if ch.get("ad_bot_id") and ch["ad_bot_id"] != MARKETPLACE_BOT_ID:
                        # logger.info(f"⛔ Kanal kilitli | Kanal {tg_id} | Yetkili Bot: {ch['ad_bot_id']}")
                        continue

                    # 🔐 KİLİT YOKSA BU BOT KİLİTLER
                    if not ch.get("ad_bot_id"):
                        try:
                            supabase.table("channels").update({
                                "ad_bot_id": MARKETPLACE_BOT_ID
                            }).eq("id", ch["id"]).execute()
                            logger.info(f"🔐 Kanal kilitlendi | Kanal {tg_id} | Bot {MARKETPLACE_BOT_ID}")
                        except Exception as lock_err:
                            logger.error(f"❌ Kilit hatası: {lock_err}")
                            continue

                    # Zaten gönderilmişse atla
                    if tg_id in processed:
                        continue

                    try:
                        logger.info(f"➡️ Gönderiliyor | Reklam {promo['id']} → Kanal {tg_id}")

                        kb = InlineKeyboardBuilder()
                        if promo.get("button_text") and promo.get("button_link"):
                            kb.row(types.InlineKeyboardButton(
                                text=promo["button_text"],
                                callback_data=f"promo_click_{promo['id']}"
                            ))

                        caption = f"<b>{promo['title']}</b>\n\n{promo['content']}"

                        if promo.get("image_url"):
                            await bot.send_photo(
                                chat_id=tg_id,
                                photo=promo["image_url"],
                                caption=caption,
                                parse_mode="HTML",
                                reply_markup=kb.as_markup()
                            )
                        else:
                            await bot.send_message(
                                chat_id=tg_id,
                                text=caption,
                                parse_mode="HTML",
                                reply_markup=kb.as_markup()
                            )

                        processed.add(tg_id)
                        reach += int(ch.get("member_count") or 0)
                        newly_processed_count += 1

                        # Her başarılı gönderimde reklamı güncelle
                        supabase.table("promotions").update({
                            "processed_channels": list(processed),
                            "total_reach": reach,
                            "channel_count": len(processed)
                        }).eq("id", promo["id"]).execute()

                        logger.info(f"✅ Gönderildi | Kanal {tg_id}")
                        await asyncio.sleep(0.5) # Rate limit koruması

                    except Exception as e:
                        err_msg = str(e).lower()
                        logger.error(f"❌ Gönderim Hatası | Kanal {tg_id} | {e}")
                        
                        # Bot kanaldan atılmışsa veya kanal bulunamıyorsa pasife al
                        if any(x in err_msg for x in ["kicked", "chat not found", "blocked", "forbidden"]):
                            supabase.table("channels").update({
                                "revenue_enabled": False,
                                "ad_bot_id": None
                            }).eq("id", ch["id"]).execute()
                            logger.warning(f"🚫 Kanal pasife alındı: {tg_id}")

                # Eğer tüm kanallara gönderildiyse durumu 'sent' yap
                if len(channels) > 0 and len(processed) >= len(channels):
                    supabase.table("promotions").update({
                        "status": "sent",
                        "sent_at": UTCNOW()
                    }).eq("id", promo["id"]).execute()
                    logger.info(f"🏁 Reklam tamamlandı | ID={promo['id']} | Reach={reach}")
                elif newly_processed_count == 0:
                    logger.info(f"⏳ Reklam beklemede (Bu döngüde yeni kanal yok) | ID={promo['id']}")

        except Exception:
            logger.exception("🔥 Dispatcher error")

        await asyncio.sleep(20)

# =====================================================
# 🔘 2. CLICK TRACK
# =====================================================
@dp.callback_query(F.data.startswith("promo_click_"))
async def promo_click(cb: CallbackQuery):
    pid = cb.data.replace("promo_click_", "")
    promo = supabase.table("promotions") \
        .select("click_count, button_link") \
        .eq("id", pid) \
        .maybe_single().execute().data

    if promo:
        supabase.table("promotions").update({
            "click_count": int(promo.get("click_count") or 0) + 1
        }).eq("id", pid).execute()

        if promo.get("button_link"):
            await cb.message.answer(
                "🔗 Bağlantı hazır",
                reply_markup=InlineKeyboardBuilder().row(
                    types.InlineKeyboardButton(text="Aç", url=promo["button_link"])
                ).as_markup()
            )
    await cb.answer()

# =====================================================
# 🚀 3. /START (OWNER + ADMIN)
# =====================================================
@dp.message(CommandStart())
async def start_cmd(msg: types.Message):
    uid = str(msg.from_user.id)
    chat = msg.chat

    if chat.type in ("group", "supergroup"):
        bot_member = await bot.get_chat_member(chat.id, bot.id)
        if bot_member.status != "administrator":
            return await msg.reply("⚠️ Bot admin değil.")

        user_member = await bot.get_chat_member(chat.id, msg.from_user.id)
        if user_member.status != "creator":
            return await msg.reply("❌ Sadece grup sahibi entegre edebilir.")

        owned = supabase.table("user_bots") \
            .select("*") \
            .eq("user_id", uid) \
            .eq("bot_id", MARKETPLACE_BOT_ID) \
            .eq("is_active", True) \
            .execute().data

        if not owned:
            return await msg.reply("❌ Bot size ait değil.")

        members = await bot.get_chat_member_count(chat.id)

        channel = supabase.table("channels").upsert({
            "user_id": uid,
            "telegram_id": str(chat.id),
            "name": chat.title,
            "member_count": members,
            "revenue_enabled": True,
            "archived": False,
            "created_at": UTCNOW()
        }, on_conflict="telegram_id").execute().data[0]

        supabase.table("bot_connections").upsert({
            "user_id": uid,
            "bot_id": MARKETPLACE_BOT_ID,
            "channel_id": channel["id"],
            "is_admin_verified": True,
            "last_check_at": UTCNOW(),
            "status": "active"
        }, on_conflict="channel_id").execute()

        info_msg = await msg.reply(
            "✅ Entegrasyon başarıyla tamamlandı.\n"
            "ℹ️ Bot artık bu grupta aktif."
        )

        await asyncio.sleep(3)

        try:
            await info_msg.delete()
        except Exception:
            pass

    # DM
    supabase.table("users").upsert({
        "id": uid,
        "name": msg.from_user.full_name,
        "username": msg.from_user.username,
        "status": "Active",
        "joindate": UTCNOW()
    }).execute()

    kb = InlineKeyboardBuilder()
    kb.row(types.InlineKeyboardButton(
        text="Mağaza",
        web_app=types.WebAppInfo(url=MINI_APP_URL)
    ))
    await msg.answer("👋 BotlyHub", reply_markup=kb.as_markup())

# =====================================================
# 🔄 4. BOT ADMIN DÜŞERSE → KİLİT KALKAR
# =====================================================
@dp.my_chat_member()
async def admin_watch(event: ChatMemberUpdated):
    chat_id = str(event.chat.id)

    if event.new_chat_member.status != "administrator":
        supabase.table("channels").update({
            "revenue_enabled": False,
            "ad_bot_id": None
        }).eq("telegram_id", chat_id).execute()

        supabase.table("bot_connections").update({
            "status": "passive"
        }).eq("channel_id", chat_id).execute()

# =====================================================
# 🗑️ 5. GRUP SİLİNİRSE → ARŞİV + KİLİT KALKAR
# =====================================================
@dp.chat_member()
async def group_removed(event: ChatMemberUpdated):
    if event.new_chat_member.status in ("left", "kicked"):
        supabase.table("channels").update({
            "archived": True,
            "archived_at": UTCNOW(),
            "ad_bot_id": None
        }).eq("telegram_id", str(event.chat.id)).execute()

# =====================================================
# ▶️ RUN
# =====================================================
async def main():
    asyncio.create_task(ad_dispatcher_task())
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
