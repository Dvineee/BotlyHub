import logging
from aiogram import Router, types, F
from aiogram.filters import Command
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

router = Router()

# Supabase setup
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

@router.message(Command("account"))
@router.message(Command("profil"))
@router.message(F.text == "👤 Hesabım")
async def cmd_account(message: types.Message):
    user_id = str(message.from_user.id)
    
    try:
        if not supabase:
            await message.answer("Sistem şu anda meşgul, lütfen daha sonra tekrar deneyin.")
            return

        # Fetch user data
        user_res = supabase.table("users").select("*").eq("id", user_id).execute()
        if not user_res.data:
            await message.answer("Kullanıcı kaydı bulunamadı. Lütfen /start komutunu kullanın.")
            return
            
        user = user_res.data[0]
        
        # Fetch wallet data
        wallet_res = supabase.table("user_wallets").select("*").eq("user_id", user_id).execute()
        wallet = wallet_res.data[0] if wallet_res.data else {"balance": 0, "total_earned": 0}
        
        # Referral link
        bot_username = (await message.bot.get_me()).username
        ref_link = f"https://t.me/{bot_username}?start=ref_{user_id}"
        
        text = (
            f"👤 *Hesap Bilgileri*\n\n"
            f"🆔 *ID:* `{user_id}`\n"
            f"👤 *İsim:* {user.get('name', 'Bilinmiyor')}\n"
            f"📅 *Kayıt:* {user.get('joindate', 'Bilinmiyor')[:10]}\n\n"
            f"💰 *Cüzdan Bakiyesi:* `{wallet.get('balance', 0)}` Hub Puanı\n"
            f"📈 *Toplam Kazanç:* `{wallet.get('total_earned', 0)}` Hub Puanı\n"
            f"👥 *Referans Sayısı:* `{user.get('referral_count', 0)}` Kişi\n\n"
            f"🔗 *Referans Linkiniz:*\n`{ref_link}`"
        )
        
        keyboard = types.InlineKeyboardMarkup(inline_keyboard=[
            [types.InlineKeyboardButton(text="🌍 Web Paneli", url="https://botlyhub.com/user-panel")],
            [types.InlineKeyboardButton(text="🎁 Ödüller", callback_data="view_rewards")]
        ])
        
        await message.answer(text, parse_mode="Markdown", reply_markup=keyboard)
        
    except Exception as e:
        logging.error(f"Error in account handler: {e}")
        await message.answer("Bir hata oluştu. Lütfen daha sonra tekrar deneyin.")
