import logging
import datetime
from datetime import timezone

# --- CONFIG ---
BOT_TOKEN = "8546984280:AAEg8rIho2IrqmjRl9t5BYAkFgkPAdL_130"
SUPABASE_URL = "https://yrbnzyvbhitlquaxnruc.supabase.co"
SUPABASE_KEY = "sb_secret_F0j5s-9UJAWdQwA75PMzQw_IuACUZbV"
MINI_APP_URL = "https://botlyhub.vercel.app/"
MARKETPLACE_BOT_ID = "BOT-99204-SOP"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("BotlyHub")

def UTCNOW():
    return datetime.datetime.now(timezone.utc).isoformat()
