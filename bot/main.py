import asyncio
import logging
import datetime
import httpx
import re
from datetime import timezone
from bs4 import BeautifulSoup

from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import CommandStart
from aiogram.types import ChatMemberUpdated, CallbackQuery
from aiogram.utils.keyboard import InlineKeyboardBuilder

from supabase import create_client, Client

# --- CONFIG ---
# Kullanıcı tarafından sağlanan güncel bilgiler
BOT_TOKEN = "8468942589:AAEmh541e7JYCd0iNsyi9iyyN1O9e8njJFc"
SUPABASE_URL = "https://yrbnzyvbhitlquaxnruc.supabase.co"
SUPABASE_KEY = "sb_secret_F0j5s-9UJAWdQwA75PMzQw_IuACUZbV"
MINI_APP_URL = "https://botlyhub.vercel.app/#/"
MARKETPLACE_BOT_ID = "BOT-82202-C5G"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

bot = Bot(BOT_TOKEN)
dp = Dispatcher()
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

UTCNOW = lambda: datetime.datetime.now(timezone.utc).isoformat()

# =====================================================
# 📊 GÖRÜNTÜLENME TARAMA FONKSİYONLARI
# =====================================================
def parse_views(views_str):
    if not views_str: return 0
    views_str = views_str.upper().replace(',', '.')
    try:
        if 'K' in views_str:
            return int(float(views_str.replace('K', '')) * 1000)
        if 'M' in views_str:
            return int(float(views_str.replace('M', '')) * 1000000)
        return int(re.sub(r'\D', '', views_str) or 0)
    except:
        return 0

async def get_telegram_stats(username, message_id):
    if not username or not message_id: return 0, 0
    url = f"https://t.me/{username}/{message_id}?embed=1"
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(url)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, 'html.parser')
                
                # Görüntülenme çek
                views = 0
                views_span = soup.find('span', class_='tgme_widget_message_views')
                if views_span:
                    views = parse_views(views_span.text)
                
                # Tepkileri çek
                reactions = 0
                reactions_div = soup.find('div', class_='tgme_widget_message_reactions')
                if reactions_div:
                    count_tags = reactions_div.find_all('span', class_='tgme_widget_message_reaction_count')
                    reactions = sum(parse_views(t.text) for t in count_tags)
                
                return views, reactions
        except Exception as e:
            logger.error(f"Scrape Error ({username}/{message_id}): {e}")
    return 0, 0

async def update_views_loop():
    """Arka planda reklam görüntülenmelerini ve tepkilerini güncelleyen döngü"""
    logger.info("📊 İstatistik takip döngüsü başlatıldı")
    while True:
        try:
            # Son 24 saatte gönderilmiş reklamları kontrol et
            res = supabase.table("promotions") \
                .select("*") \
                .in_("status", ["sent", "sending"]) \
                .execute()
            
            promos = res.data or []
            for p in promos:
                source_channel = p.get("source_channel")
                source_msg_id = p.get("source_message_id")
                message_map = p.get("message_map") or {}
                
                total_views = 0
                total_reactions = 0
                
                # ÖNCELİK: ANA KANAL (Merkezi İstatistik)
                if source_channel and source_msg_id:
                    try:
                        # source_channel @ ile başlıyorsa temizle
                        username = str(source_channel).replace("@", "")
                        views, reacts = await get_telegram_stats(username, source_msg_id)
                        total_views = views
                        total_reactions = reacts
                    except Exception as e:
                        logger.error(f"❌ Ana kanal istatistik hatası: {e}")

                # EĞER ANA KANAL YOKSA VEYA 0 DÖNDÜYSE (Eski sistem veya fallback)
                if total_views == 0 and message_map:
                    for tg_id, msg_id in message_map.items():
                        try:
                            chat = await bot.get_chat(tg_id)
                            if chat.username:
                                views, reacts = await get_telegram_stats(chat.username, msg_id)
                                total_views += views
                                total_reactions += reacts
                        except Exception:
                            pass
                
                # Veritabanını güncelle
                try:
                    supabase.table("promotions").update({
                        "total_views": total_views,
                        "total_reactions": total_reactions,
                        "views_updated_at": UTCNOW()
                    }).eq("id", p["id"]).execute()
                    
                    if total_views > 0 or total_reactions > 0:
                        logger.info(f"📈 Reklam {p['id']} güncellendi: {total_views} gözlem, {total_reactions} tepki")
                except Exception as db_err:
                    # Sütunlar yoksa sessizce geç
                    err_str = str(db_err)
                    if "total_views" in err_str or "total_reactions" in err_str:
                        pass
                    else:
                        logger.error(f"❌ Stats Update DB Error: {db_err}")

            await asyncio.sleep(60) # 1 dakikada bir güncelle
        except Exception as e:
            logger.error(f"❌ Stats Loop Error: {e}")
            await asyncio.sleep(60)

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

            # 2. Reklam alabilecek kanalları çek
            channels = supabase.table("channels") \
                .select("*") \
                .eq("revenue_enabled", True) \
                .eq("archived", False) \
                .execute().data or []

            for promo in promos:
                source_channel = promo.get("source_channel")
                source_msg_id = promo.get("source_message_id")
                processed = set(promo.get("processed_channels") or [])
                reach = int(promo.get("total_reach") or 0)
                
                # 1. ADIM: ANA KANALA PAYLAŞIM (ZORUNLU)
                if source_channel and not source_msg_id:
                    try:
                        logger.info(f"📢 Ana kanala paylaşılıyor: {source_channel}")
                        kb = InlineKeyboardBuilder()
                        if promo.get("button_text") and promo.get("button_link"):
                            kb.row(types.InlineKeyboardButton(text=promo["button_text"], url=promo["button_link"]))

                        caption = f"<b>{promo['title']}</b>\n\n{promo['content']}"
                        sent = None
                        
                        if promo.get("image_url"):
                            sent = await bot.send_photo(chat_id=source_channel, photo=promo["image_url"], caption=caption, parse_mode="HTML", reply_markup=kb.as_markup())
                        else:
                            sent = await bot.send_message(chat_id=source_channel, text=caption, parse_mode="HTML", reply_markup=kb.as_markup())

                        if sent:
                            source_msg_id = sent.message_id
                            supabase.table("promotions").update({"source_message_id": source_msg_id}).eq("id", promo["id"]).execute()
                            logger.info(f"✅ Ana kanal paylaşımı başarılı. ID: {source_msg_id}")
                    except Exception as e:
                        logger.error(f"❌ Ana kanal paylaşım hatası ({source_channel}): {e}")
                        continue # Ana kanala paylaşılamazsa ilerleyemeyiz

                if not source_channel or not source_msg_id:
                    logger.warning(f"⚠️ Reklam atlanıyor: Ana kanal veya Mesaj ID eksik ({promo['title']})")
                    continue

                # 2. ADIM: DİĞER KANALLARA İLETME (ZORUNLU)
                newly_processed = 0
                for ch in channels:
                    tg_id = str(ch["telegram_id"])
                    
                    # Ana kanalın kendisine veya zaten işlenmişlere gönderme
                    if tg_id == str(source_channel) or tg_id in processed:
                        continue

                    try:
                        # Sadece İLETME (Forward) yapıyoruz
                        # aiogram: forward_message(chat_id, from_chat_id, message_id)
                        sent_msg = await bot.forward_message(chat_id=tg_id, from_chat_id=source_channel, message_id=source_msg_id)
                        
                        if sent_msg:
                            processed.add(tg_id)
                            reach += int(ch.get("member_count") or 0)
                            newly_processed += 1
                            
                            # Mesaj haritasını güncelle (İstatistik takibi için)
                            m_map = promo.get("message_map") or {}
                            m_map[tg_id] = sent_msg.message_id
                            
                            supabase.table("promotions").update({
                                "processed_channels": list(processed),
                                "total_reach": reach,
                                "channel_count": len(processed),
                                "message_map": m_map
                            }).eq("id", promo["id"]).execute()
                            
                            logger.info(f"✅ İletildi -> {ch['name']}")
                        
                        await asyncio.sleep(0.5)
                    except Exception as e:
                        logger.error(f"❌ İletim Hatası ({ch['name']}): {e}")
                        if any(x in str(e).lower() for x in ["kicked", "chat not found", "blocked"]):
                            supabase.table("channels").update({"revenue_enabled": False}).eq("id", ch["id"]).execute()

                # Bitiş kontrolü
                if len(channels) > 0 and len(processed) >= (len(channels) - 1 if source_channel in [c["telegram_id"] for c in channels] else len(channels)):
                    supabase.table("promotions").update({"status": "sent", "sent_at": UTCNOW()}).eq("id", promo["id"]).execute()
                    logger.info(f"🏁 Reklam tamamlandı: {promo['title']}")

        except Exception:
            logger.exception("🔥 Dispatcher error")

        await asyncio.sleep(20)

# =====================================================
# ❤️ 2. TEPKİ TAKİBİ (REACTIONS)
# =====================================================
@dp.message_reaction()
async def on_reaction_update(event: types.MessageReactionUpdated):
    """Reklam mesajlarına verilen tepkileri yakalar ve kaydeder"""
    chat_id = str(event.chat.id)
    msg_id = event.message_id
    user = event.user
    user_id = str(user.id) if user else "anonymous"
    user_name = user.full_name if user else "Anonim"
    
    # Yeni tepkileri al
    new_reacts = [r.emoji for r in event.new_reaction if r.type == "emoji"]
    # Custom emoji desteği
    custom_reacts = [r.custom_emoji_id for r in event.new_reaction if r.type == "custom_emoji"]
    all_reacts = new_reacts + custom_reacts
    
    if not all_reacts:
        logger.info(f"🗑️ Tepki kaldırıldı | User: {user_name} ({user_id}) | Msg: {msg_id}")
        return

    logger.info(f"❤️ Tepki algılandı | User: {user_name} | Msg: {msg_id} | Reacts: {all_reacts}")
    
    try:
        # Hangi reklama ait olduğunu bul
        # Not: Bu işlem performans için son 50 reklamla sınırlanabilir
        res = supabase.table("promotions") \
            .select("id, title") \
            .in_("status", ["sent", "sending"]) \
            .order("created_at", desc=True) \
            .limit(50) \
            .execute()
        
        promo_id = None
        promo_title = "Bilinmeyen Reklam"
        
        for p in res.data or []:
            m_map = p.get("message_map") or {}
            if m_map.get(chat_id) == msg_id:
                promo_id = p["id"]
                promo_title = p["title"]
                break
        
        if promo_id:
            # Tepkiyi veri olarak sakla (bot_logs tablosuna detaylı yazıyoruz)
            supabase.table("bot_logs").insert({
                "user_id": user_id,
                "type": "ad_reaction",
                "action_key": f"react_{promo_id}_{msg_id}",
                "title": "Reklam Tepkisi",
                "description": f"'{user_name}' kullanıcısı '{promo_title}' reklamına tepki verdi: {', '.join(all_reacts)}",
                "created_at": UTCNOW()
            }).execute()
            
            logger.info(f"✅ Tepki veritabanına kaydedildi: {promo_title}")
            
    except Exception as e:
        logger.error(f"❌ Tepki kayıt hatası: {e}")

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
    # WebApp URL'sinin sonundaki /#/' kısmını temizleyip deneyelim, bazı sürümlerde sorun çıkarabiliyor
    clean_url = MINI_APP_URL.rstrip('/')
    
    kb.row(types.InlineKeyboardButton(
        text="Mağaza",
        web_app=types.WebAppInfo(url=clean_url)
    ))
    kb.row(types.InlineKeyboardButton(
        text="Market (Web)",
        url=MINI_APP_URL
    ))
    
    try:
        await msg.answer("👋 BotlyHub V3'e Hoş Geldiniz!", reply_markup=kb.as_markup())
    except Exception as e:
        logger.error(f"❌ Klavye hatası: {e}")
        # Hata durumunda klavyesiz gönder
        await msg.answer("👋 BotlyHub V3'e Hoş Geldiniz!")

# =====================================================
# 🔄 4. BOT ADMIN OLURSA/DÜŞERSE → KAYIT VE KİLİT
# =====================================================
@dp.my_chat_member()
async def admin_watch(event: ChatMemberUpdated):
    chat_id = str(event.chat.id)
    chat_title = event.chat.title or "İsimsiz Kanal"

    if event.new_chat_member.status == "administrator":
        # 🟢 Bot admin oldu -> Kanalları sisteme kaydet/güncelle
        try:
            member_count = await bot.get_chat_member_count(chat_id)
            
            supabase.table("channels").upsert({
                "telegram_id": chat_id,
                "name": chat_title,
                "username": event.chat.username,
                "member_count": member_count,
                "revenue_enabled": True,
                "ad_bot_id": MARKETPLACE_BOT_ID,
                "archived": False,
                "updated_at": UTCNOW()
            }, on_conflict="telegram_id").execute()
            
            logger.info(f"✅ Kanal Sisteme Eklendi: {chat_title} ({chat_id})")
            
            # Kanala bilgi mesajı gönder
            try:
                await bot.send_message(chat_id, "✅ <b>BotlyHub Reklam Sistemi Aktif!</b>\n\nBu kanal artık reklam havuzuna dahil edildi ve otomatik reklam alabilir.", parse_mode="HTML")
            except Exception as e:
                logger.warning(f"⚠️ Kanala mesaj atılamadı (Yetki eksik olabilir): {e}")
                
        except Exception as e:
            logger.error(f"❌ Kanal kayıt hatası: {e}")

    elif event.new_chat_member.status in ("left", "kicked", "member"):
        # 🔴 Bot çıkarıldı veya yetkisi alındı
        supabase.table("channels").update({
            "revenue_enabled": False,
            "ad_bot_id": None
        }).eq("telegram_id", chat_id).execute()
        
        supabase.table("bot_connections").update({
            "status": "passive"
        }).eq("channel_id", chat_id).execute()
        logger.info(f"🚫 Kanal Devre Dışı Bırakıldı: {chat_title} ({chat_id})")

# =====================================================
# 📢 5. KANAL MESAJLARINI ALGILAMA (CHANNEL POST)
# =====================================================
@dp.channel_post(CommandStart())
async def channel_start_handler(post: types.Message):
    """Kanalda /start komutu yazılırsa çalışır"""
    chat_id = str(post.chat.id)
    chat_title = post.chat.title or "İsimsiz Kanal"
    
    # Kanalı veritabanına kaydet/güncelle
    try:
        member_count = await bot.get_chat_member_count(chat_id)
        supabase.table("channels").upsert({
            "telegram_id": chat_id,
            "name": chat_title,
            "username": post.chat.username,
            "member_count": member_count,
            "revenue_enabled": True,
            "ad_bot_id": MARKETPLACE_BOT_ID,
            "archived": False,
            "updated_at": UTCNOW()
        }, on_conflict="telegram_id").execute()
        logger.info(f"✅ Kanal Manuel Kayıt Edildi: {chat_title} ({chat_id})")
    except Exception as e:
        logger.error(f"❌ Kanal manuel kayıt hatası: {e}")

    kb = InlineKeyboardBuilder()
    # Kanallarda web_app butonları desteklenmez, bu yüzden normal URL kullanıyoruz
    kb.row(types.InlineKeyboardButton(
        text="Yönetim Paneli",
        url=MINI_APP_URL
    ))
    try:
        await post.answer(
            f"🤖 <b>BotlyHub Reklam Yönetimi</b>\n\nKanal ID: <code>{post.chat.id}</code>\nDurum: Aktif",
            reply_markup=kb.as_markup(),
            parse_mode="HTML"
        )
    except Exception as e:
        logger.error(f"❌ Kanal cevap hatası: {e}")

@dp.channel_post()
async def channel_message_logger(post: types.Message):
    """Kanalda paylaşılan herhangi bir mesajı loglar (Algılama testi için)"""
    if post.text:
        logger.info(f"📡 Kanal Mesajı Algılandı [{post.chat.title}]: {post.text[:50]}...")

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
    asyncio.create_task(update_views_loop())
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
