import asyncio
import logging
import datetime
<<<<<<< HEAD
import httpx
import re
from datetime import timezone
from bs4 import BeautifulSoup
=======
from datetime import timezone
>>>>>>> e89adc49cd47974c931285eab89136e716c901df

from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import CommandStart
from aiogram.types import ChatMemberUpdated, CallbackQuery
from aiogram.utils.keyboard import InlineKeyboardBuilder

from supabase import create_client, Client

# --- CONFIG ---
# Kullanıcı tarafından sağlanan güncel bilgiler
BOT_TOKEN = "8468942589:AAEmh541e7JYCd0iNsyi9iyyN1O9e8njJFc"
<<<<<<< HEAD
SUPABASE_URL = "https://yrbnzyvbhitlquaxnruc.supabase.co"
SUPABASE_KEY = "sb_secret_F0j5s-9UJAWdQwA75PMzQw_IuACUZbV"
=======
SUPABASE_URL = "https://ybnxfwqrduuinzgnbymc.supabase.co"
SUPABASE_KEY = "sb_secret_jDxdXsQ-wb4RelA0hOfNkg_LTINMqJ5"
>>>>>>> e89adc49cd47974c931285eab89136e716c901df
MINI_APP_URL = "https://botlyhub.vercel.app/#/"
MARKETPLACE_BOT_ID = "BOT-82202-C5G"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

bot = Bot(BOT_TOKEN)
dp = Dispatcher()
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

UTCNOW = lambda: datetime.datetime.now(timezone.utc).isoformat()

# =====================================================
<<<<<<< HEAD
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
                message_map = p.get("message_map") or {}
                if not message_map: continue
                
                total_views = 0
                total_reactions = 0
                for tg_id, msg_id in message_map.items():
                    try:
                        chat = await bot.get_chat(tg_id)
                        if chat.username:
                            views, reacts = await get_telegram_stats(chat.username, msg_id)
                            total_views += views
                            total_reactions += reacts
                    except Exception as e:
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
=======
>>>>>>> e89adc49cd47974c931285eab89136e716c901df
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
<<<<<<< HEAD
            all_channels_res = supabase.table("channels").select("*").execute()
            all_channels = all_channels_res.data or []
            
            # Filtreleme detaylarını logla
            revenue_enabled_count = len([c for c in all_channels if c.get("revenue_enabled")])
            not_archived_count = len([c for c in all_channels if not c.get("archived")])
            
            channels = [c for c in all_channels if c.get("revenue_enabled") and not c.get("archived")]

            logger.info(
                f"📡 Kanal İstatistiği: Toplam={len(all_channels)} | "
                f"Gelir Aktif={revenue_enabled_count} | "
                f"Arşivlenmemiş={not_archived_count} | "
                f"Yayınlanabilir={len(channels)}"
            )
=======
            # Not: archived=False yerine archived is not True kontrolü daha güvenli (NULL durumları için)
            channels_data = supabase.table("channels") \
                .select("*") \
                .eq("revenue_enabled", True) \
                .execute().data or []
            
            # Filtreleme: archived True olmayanları al (False veya None/Null olanlar)
            channels = [c for c in channels_data if not c.get("archived")]

            logger.info(f"📡 Reklam alabilecek {len(channels)} kanal var")
>>>>>>> e89adc49cd47974c931285eab89136e716c901df

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
<<<<<<< HEAD
                                url=promo["button_link"]
                            ))

                        caption = f"<b>{promo['title']}</b>\n\n{promo['content']}"
                        sent_msg = None

                        try:
                            if promo.get("image_url"):
                                sent_msg = await bot.send_photo(
                                    chat_id=tg_id,
                                    photo=promo["image_url"],
                                    caption=caption,
                                    parse_mode="HTML",
                                    reply_markup=kb.as_markup()
                                )
                            else:
                                sent_msg = await bot.send_message(
                                    chat_id=tg_id,
                                    text=caption,
                                    parse_mode="HTML",
                                    reply_markup=kb.as_markup()
                                )
                        except Exception as photo_err:
                            # Resim gönderme hatası (URL geçersiz vb.) durumunda metin olarak dene
                            if promo.get("image_url"):
                                logger.warning(f"⚠️ Resim gönderilemedi, metin olarak deneniyor: {photo_err}")
                                sent_msg = await bot.send_message(
                                    chat_id=tg_id,
                                    text=f"{caption}\n\n<i>(Görsel yüklenemedi: {str(photo_err)[:50]}...)</i>",
                                    parse_mode="HTML",
                                    reply_markup=kb.as_markup()
                                )
                            else:
                                raise photo_err
=======
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
>>>>>>> e89adc49cd47974c931285eab89136e716c901df

                        processed.add(tg_id)
                        reach += int(ch.get("member_count") or 0)
                        newly_processed_count += 1
<<<<<<< HEAD
                        
                        # Mesaj ID'sini kaydet
                        if "message_map" not in promo or promo["message_map"] is None:
                            promo["message_map"] = {}
                        
                        if sent_msg:
                            promo["message_map"][str(tg_id)] = sent_msg.message_id

                        # Her başarılı gönderimde reklamı güncelle
                        update_data = {
                            "processed_channels": list(processed),
                            "total_reach": reach,
                            "channel_count": len(processed),
                            "last_error": None
                        }
                        
                        # message_map sütunu varsa ekle
                        if promo.get("message_map"):
                            update_data["message_map"] = promo["message_map"]

                        try:
                            supabase.table("promotions").update(update_data).eq("id", promo["id"]).execute()
                        except Exception as db_err:
                            # Eğer message_map hatası alırsak, onsuz tekrar dene
                            if "message_map" in str(db_err):
                                logger.warning("⚠️ 'message_map' sütunu bulunamadı, bu veri kaydedilmeyecek.")
                                update_data.pop("message_map", None)
                                supabase.table("promotions").update(update_data).eq("id", promo["id"]).execute()
                            else:
                                raise db_err
=======

                        # Her başarılı gönderimde reklamı güncelle
                        supabase.table("promotions").update({
                            "processed_channels": list(processed),
                            "total_reach": reach,
                            "channel_count": len(processed)
                        }).eq("id", promo["id"]).execute()
>>>>>>> e89adc49cd47974c931285eab89136e716c901df

                        logger.info(f"✅ Gönderildi | Kanal {tg_id}")
                        await asyncio.sleep(0.5) # Rate limit koruması

                    except Exception as e:
                        err_msg = str(e).lower()
                        logger.error(f"❌ Gönderim Hatası | Kanal {tg_id} | {e}")
                        
<<<<<<< HEAD
                        # Hatayı veritabanına işle (Kullanıcının görmesi için)
                        try:
                            supabase.table("promotions").update({
                                "last_error": f"Kanal {tg_id}: {str(e)}"
                            }).eq("id", promo["id"]).execute()
                        except:
                            pass
                        
=======
>>>>>>> e89adc49cd47974c931285eab89136e716c901df
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
<<<<<<< HEAD
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
=======
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
>>>>>>> e89adc49cd47974c931285eab89136e716c901df

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
<<<<<<< HEAD
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
=======
    kb.row(types.InlineKeyboardButton(
        text="Mağaza",
        web_app=types.WebAppInfo(url=MINI_APP_URL)
    ))
    await msg.answer("👋 BotlyHub", reply_markup=kb.as_markup())

# =====================================================
# 🔄 4. BOT ADMIN DÜŞERSE → KİLİT KALKAR
>>>>>>> e89adc49cd47974c931285eab89136e716c901df
# =====================================================
@dp.my_chat_member()
async def admin_watch(event: ChatMemberUpdated):
    chat_id = str(event.chat.id)
<<<<<<< HEAD
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
=======

    if event.new_chat_member.status != "administrator":
>>>>>>> e89adc49cd47974c931285eab89136e716c901df
        supabase.table("channels").update({
            "revenue_enabled": False,
            "ad_bot_id": None
        }).eq("telegram_id", chat_id).execute()
<<<<<<< HEAD
        
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
=======

        supabase.table("bot_connections").update({
            "status": "passive"
        }).eq("channel_id", chat_id).execute()
>>>>>>> e89adc49cd47974c931285eab89136e716c901df

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
<<<<<<< HEAD
    asyncio.create_task(update_views_loop())
=======
>>>>>>> e89adc49cd47974c931285eab89136e716c901df
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
