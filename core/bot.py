from aiogram import Bot, Dispatcher
from supabase import create_client, Client
from core.config import BOT_TOKEN, SUPABASE_URL, SUPABASE_KEY

bot = Bot(BOT_TOKEN)
dp = Dispatcher()
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
