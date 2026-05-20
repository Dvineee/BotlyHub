from aiogram import Router, types
from aiogram.filters import CommandStart
from aiogram.types import ChatMemberUpdated
from aiogram.utils.keyboard import InlineKeyboardBuilder
from core.bot import bot, supabase
from core.config import MARKETPLACE_BOT_ID, MINI_APP_URL, UTCNOW, logger

router = Router()

@router.my_chat_member()
async def admin_watch(event: ChatMemberUpdated):
    chat_id = str(event.chat.id)
    chat_title = event.chat.title or "İsimsiz Kanal"

    if event.new_chat_member.status == "administrator":
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
            
            try:
                await bot.send_message(chat_id, "✅ <b>BotlyHub Reklam Sistemi Aktif!</b>\n\nBu kanal artık reklam havuzuna dahil edildi ve otomatik reklam alabilir.", parse_mode="HTML")
            except Exception as e:
                logger.warning(f"⚠️ Kanala mesaj atılamadı (Yetki eksik olabilir): {e}")
                
        except Exception as e:
            logger.error(f"❌ Kanal kayıt hatası: {e}")

    elif event.new_chat_member.status in ("left", "kicked", "member"):
        supabase.table("channels").update({
            "revenue_enabled": False,
            "ad_bot_id": None
        }).eq("telegram_id", chat_id).execute()
        
        supabase.table("bot_connections").update({
            "status": "passive"
        }).eq("channel_id", chat_id).execute()
        logger.info(f"🚫 Kanal Devre Dışı Bırakıldı: {chat_title} ({chat_id})")


@router.channel_post(CommandStart())
async def channel_start_handler(post: types.Message):
    chat_id = str(post.chat.id)
    chat_title = post.chat.title or "İsimsiz Kanal"
    
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

@router.channel_post()
async def channel_message_logger(post: types.Message):
    if post.text:
        logger.info(f"📡 Kanal Mesajı Algılandı [{post.chat.title}]: {post.text[:50]}...")


@router.chat_member()
async def group_removed(event: ChatMemberUpdated):
    if event.new_chat_member.status in ("left", "kicked"):
        supabase.table("channels").update({
            "archived": True,
            "archived_at": UTCNOW(),
            "ad_bot_id": None
        }).eq("telegram_id", str(event.chat.id)).execute()
