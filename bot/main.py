import asyncio
import logging
import os
import sys
from aiogram import Bot, Dispatcher
from aiogram.enums import ParseMode
from aiogram.fsm.storage.memory import MemoryStorage
from dotenv import load_dotenv

# Ensure we can import from handlers
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from handlers import referral

load_dotenv()

async def main():
    # Logging configuration
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )

    # Initialize bot and dispatcher
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not token:
        logging.error("TELEGRAM_BOT_TOKEN environment variable is missing!")
        # If we have TELEGRAM_AUTH_BOT_TOKEN, use it as fallback for development
        token = os.getenv("TELEGRAM_AUTH_BOT_TOKEN")
        if not token:
            return

    bot = Bot(token=token)
    dp = Dispatcher(storage=MemoryStorage())

    # Register routers
    dp.include_router(referral.router)
    dp.include_router(account.router)
    dp.include_router(search.router)
    dp.include_router(common.router)

    # Start polling
    logging.info(f"Bot starting on token: {token[:5]}...{token[-5:]}")
    await dp.start_polling(bot)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logging.info("Bot stopped.")
    except Exception as e:
        logging.error(f"Bot crashed: {e}")
