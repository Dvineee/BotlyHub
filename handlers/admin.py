import asyncio
from aiogram import Router, types
from aiogram.filters import CommandStart
from aiogram.utils.keyboard import InlineKeyboardBuilder
from core.bot import bot, supabase
from core.config import MARKETPLACE_BOT_ID, MINI_APP_URL, UTCNOW, logger

router = Router()

@router.message(CommandStart())
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
        await msg.answer("👋 BotlyHub V3'e Hoş Geldiniz!")
