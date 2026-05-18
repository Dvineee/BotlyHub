import logging
from aiogram import Router, types, F
from aiogram.filters import Command, CommandObject
from supabase import create_client, Client
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

router = Router()

# Supabase setup
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    logging.warning("Supabase credentials missing in bot/handlers/referral.py")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

@router.message(Command("start"))
async def cmd_start(message: types.Message, command: CommandObject):
    user_id = str(message.from_user.id)
    username = message.from_user.username or f"user_{user_id}"
    full_name = message.from_user.full_name
    args = command.args
    
    # 1. Sync user to database
    try:
        if supabase:
            # Check if user exists
            res = supabase.table("users").select("*").eq("id", user_id).execute()
            existing_user = res.data[0] if res.data else None
            
            is_new_user = False
            if not existing_user:
                # New user registration
                is_new_user = True
                supabase.table("users").insert({
                    "id": user_id,
                    "username": username,
                    "name": full_name,
                    "joindate": datetime.utcnow().isoformat(),
                    "status": "Active",
                    "role": "User"
                }).execute()
                
                # Create wallet
                supabase.table("user_wallets").insert({
                    "user_id": user_id,
                    "balance": 0,
                    "total_earned": 0
                }).execute()
                
                logging.info(f"New user registered: {user_id} (@{username})")
            
            # 2. Handle Referral
            if args and args.startswith("ref_") and supabase:
                referrer_id = args.replace("ref_", "")
                
                # Don't refer yourself and only reward if new user
                if referrer_id != user_id and is_new_user:
                    # Check if referrer exists
                    ref_res = supabase.table("users").select("*").eq("id", referrer_id).execute()
                    if ref_res.data:
                        # Check if already referred (safety)
                        existing_ref = supabase.table("referrals").select("id").eq("referred_id", user_id).execute()
                        
                        if not existing_ref.data:
                            # Get referral settings for reward amount
                            settings_res = supabase.table("referral_settings").select("*").eq("id", 1).execute()
                            settings = settings_res.data[0] if settings_res.data else {"standard_reward": 100}
                            reward = settings.get("standard_reward", 100)
                            
                            # Create referral record
                            supabase.table("referrals").insert({
                                "referrer_id": referrer_id,
                                "referred_id": user_id,
                                "status": "pending",
                                "reward_amount": reward,
                                "created_at": datetime.utcnow().isoformat()
                            }).execute()
                            
                            # Update user's referred_by column
                            supabase.table("users").update({"referred_by": referrer_id}).eq("id", user_id).execute()
                            
                            logging.info(f"Referral created: {referrer_id} invited {user_id}")
                            
                            # Log activity for referrer
                            supabase.table("bot_logs").insert({
                                "user_id": referrer_id,
                                "type": "system",
                                "action_key": "referral_pending",
                                "title": "Yeni Referans (Beklemede)",
                                "description": f"Bir kullanıcı davet linkinizle katıldı. Onay bekleniyor.",
                                "created_at": datetime.utcnow().isoformat()
                            }).execute()
                            
                            # If auto_confirm is on and no special requirements, we could confirm here
                            # but usually we want to wait for join or other actions.
                            if settings.get("require_group_join") is False:
                                # Logic to confirm immediately could go here
                                pass
    except Exception as e:
        logging.error(f"Error in referral handler: {e}")

    # Standard welcome message
    welcome_text = (
        f"👋 *Merhaba {full_name}!*\n\n"
        f"BotlyHub'a hoş geldiniz. Burada en iyi Telegram botlarını keşfedebilir, "
        f"kendi botlarınızı yönetebilir ve kazanç sağlayabilirsiniz.\n\n"
        f"🚀 Başlamak için aşağıdaki butonları kullanabilirsiniz."
    )
    
    # Persistent keyboard
    main_menu = types.ReplyKeyboardMarkup(keyboard=[
        [types.KeyboardButton(text="🔍 Bot Ara"), types.KeyboardButton(text="👤 Hesabım")],
        [types.KeyboardButton(text="ℹ️ Bilgi")]
    ], resize_keyboard=True)
    
    keyboard = types.InlineKeyboardMarkup(inline_keyboard=[
        [types.InlineKeyboardButton(text="📱 Uygulamayı Aç", web_app=types.WebAppInfo(url="https://botlyhub.com"))],
        [types.InlineKeyboardButton(text="📢 Duyuru Kanalı", url="https://t.me/BotlyHub")],
        [types.InlineKeyboardButton(text="👥 Destek Grubu", url="https://t.me/BotlyHubSupport")]
    ])
    
    await message.answer(welcome_text, parse_mode="Markdown", reply_markup=main_menu)
    await message.answer("🔄 Sistem menüsü yüklendi. Hızlı erişim için butonları kullanabilirsiniz.", reply_markup=keyboard)
