import asyncio
from core.bot import bot, dp, supabase
from core.config import logger

from handlers.admin import router as admin_router
from handlers.channel import router as channel_router
from handlers.reactions import router as reactions_router
import handlers.referral as referral_handler

from tasks.dispatcher import ad_dispatcher_task
from tasks.stats import update_views_loop

async def main():
    try:
        me = await bot.get_me()
        referral_handler.BOT_USERNAME = me.username
        logger.info(f"🤖 Bot başlatıldı: @{me.username} (ID: {me.id})")
        
        res = supabase.table("promotions").select("count", count="exact").limit(1).execute()
        logger.info(f"✅ Supabase bağlantısı başarılı. Toplam reklam sayısı: {res.count}")
    except Exception as e:
        logger.error(f"❌ Başlatma hatası: {e}")

    dp.include_router(referral_handler.router)
    dp.include_router(admin_router)
    dp.include_router(channel_router)
    dp.include_router(reactions_router)
    logger.info("✅ Routerlar eklendi.")

    asyncio.create_task(ad_dispatcher_task())
    asyncio.create_task(update_views_loop())
    logger.info("✅ Arka plan görevleri başlatıldı.")
    
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
