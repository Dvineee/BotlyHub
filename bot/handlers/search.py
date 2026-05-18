import logging
from aiogram import Router, types, F
from aiogram.filters import Command, CommandObject
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

router = Router()

# Supabase setup
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

@router.message(Command("search"))
@router.message(F.text == "🔍 Bot Ara")
async def cmd_search_start(message: types.Message):
    await message.answer("🔍 Aramak istediğiniz botun adını veya kategorisini yazın:\n\nÖrn: `Eğlence` veya `@bot_adı`")

@router.message(F.text & ~F.text.startswith("/"))
async def handle_search_query(message: types.Message):
    # If the text is one of the main menu buttons, don't treat it as a search query
    if message.text in ["👤 Hesabım", "🔍 Bot Ara", "ℹ️ Bilgi"]:
        return

    query = message.text.strip()
    if len(query) < 2:
        return

    try:
        if not supabase:
            return

        # Simple search in bots table
        # We search by name or username or category
        res = supabase.table("bots").select("*").or_(f"name.ilike.%{query}%,username.ilike.%{query}%,category.ilike.%{query}%").limit(5).execute()
        
        if not res.data:
            await message.answer(f"😔 '{query}' ile ilgili bot bulunamadı. Lütfen başka bir kelime deneyin.")
            return

        text = f"🔎 *'{query}' için sonuçlar:*\n\n"
        buttons = []
        
        for bot in res.data:
            bot_name = bot.get('name', 'Bilinmeyen Bot')
            bot_user = bot.get('username', '')
            category = bot.get('category', 'Genel')
            
            text += f"🤖 *{bot_name}* (@{bot_user})\n📂 Kategori: {category}\n\n"
            buttons.append([types.InlineKeyboardButton(text=f"🤖 {bot_name}", url=f"https://t.me/{bot_user}")])
        
        keyboard = types.InlineKeyboardMarkup(inline_keyboard=buttons)
        await message.answer(text, parse_mode="Markdown", reply_markup=keyboard)

    except Exception as e:
        logging.error(f"Error in search handler: {e}")
