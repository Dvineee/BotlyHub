import asyncio
from core.bot import bot, supabase
from core.config import logger, UTCNOW
from services.scraper import get_telegram_stats

# Telegram kısıtlamalarına takılmamak ve Event Loop'u kitlememek için
# aynı anda en fazla 30 farklı kanaldan veri çekecek global sınır.
GLOBAL_SEMAPHORE = asyncio.Semaphore(30)

async def _process_promotion(p):
    """Tek bir reklamın statlarını anlık çeken asenkron fonksiyon"""
    promo_id = p["id"]
    price_per_view = float(p.get("price_per_view") or 0)
    source_channel = p.get("source_channel")
    source_msg_id = p.get("source_message_id")
    message_map = p.get("message_map") or {}
    
    total_views = 0
    total_reactions = 0
    
    tasks = []

    # 1. KANAL BAZLI İSTATİSTİKLER (ALT KANALLAR)
    if message_map:
        source_username = p.get("source_username")
        if not source_username:
            try:
                ch_res = await asyncio.to_thread(
                    lambda: supabase.table("channels").select("username").eq("telegram_id", str(source_channel)).execute()
                )
                if ch_res.data and ch_res.data[0].get("username"):
                    source_username = ch_res.data[0]["username"]
            except: pass

            if not source_username:
                try:
                    if str(source_channel) == "-1003826684282":
                        source_username = "BotlyHubAds"
                    else:
                        source_chat = await bot.get_chat(source_channel)
                        source_username = source_chat.username
                except Exception as e:
                    logger.debug(f"⚠️ Ana kanal username alınamadı ({source_channel}): {e}")

        if source_username:
            async def fetch_channel_stats(target_tg_id, src_msg_id):
                async with GLOBAL_SEMAPHORE:
                    try:
                        # Hedef kanalın username'ini al (önce DB, yoksa bot.get_chat)
                        target_username = None
                        try:
                            ch_res = await asyncio.to_thread(
                                lambda: supabase.table("channels").select("username").eq("telegram_id", str(target_tg_id)).execute()
                            )
                            if ch_res.data and ch_res.data[0].get("username"):
                                target_username = ch_res.data[0]["username"]
                        except Exception:
                            target_username = None

                        if not target_username:
                            try:
                                chat = await bot.get_chat(target_tg_id)
                                target_username = chat.username
                            except Exception:
                                target_username = None

                        if not target_username:
                            # Username yoksa scraping yapılamaz; atla
                            return 0, 0

                        views, reacts = await get_telegram_stats(target_username, src_msg_id)
                        if views > 0:
                            revenue = views * price_per_view
                            
                            def _db_upsert():
                                supabase.table("promotion_channel_stats").upsert({
                                    "promotion_id": promo_id,
                                    "channel_id": str(target_tg_id),
                                    "views": views,
                                    "revenue": revenue,
                                    "updated_at": UTCNOW()
                                }, on_conflict="promotion_id,channel_id").execute()
                                
                            await asyncio.to_thread(_db_upsert)
                        return views, reacts
                    except Exception as e:
                        return 0, 0

            for tgt, src in message_map.items():
                tasks.append(fetch_channel_stats(tgt, src))
        else:
            logger.warning(f"📊 [İSTATİSTİK ATLANDI] Ana kanal ({source_channel}) username bulunamadı.")

    # 2. ANA KANAL BAZLI İSTATİSTİK
    if source_channel and source_msg_id and str(source_channel) not in message_map:
        async def fetch_main_stats():
            async with GLOBAL_SEMAPHORE:
                username = str(source_channel).replace("@", "")
                if username.startswith("-"):
                    try:
                        chat = await bot.get_chat(source_channel)
                        if chat.username: username = chat.username
                    except: pass

                if not username.startswith("-"):
                    return await get_telegram_stats(username, source_msg_id)
                return 0, 0
                
        tasks.append(fetch_main_stats())

    # Bütün alt kanallardaki statları paralel ve anlık çalıştır!
    if tasks:
        results = await asyncio.gather(*tasks)
        for v, r in results:
            total_views += v
            total_reactions += r

    # 3. GENEL TOPLAMI GÜNCELLE
    try:
        def _db_update_total():
            supabase.table("promotions").update({
                "total_views": total_views,
                "total_reactions": total_reactions,
                "views_updated_at": UTCNOW()
            }).eq("id", promo_id).execute()
            
        await asyncio.to_thread(_db_update_total)
        
        if total_views > 0:
            logger.info(f"⚡ [ANLIK] Reklam {promo_id} TOPLAM: {total_views} views")
    except Exception as db_err:
        logger.error(f"❌ Stats Update DB Error: {db_err}")

async def update_views_loop():
    """Arka planda reklam görüntülenmelerini anlık olarak güncelleyen süper hızlı döngü"""
    logger.info("📊⚡ Ultra hızlı anlık istatistik takip döngüsü başlatıldı!")
    while True:
        try:
            # Sadece anlık gönderilen ve gönderimi süren reklamları veritabanından al
            res = await asyncio.to_thread(
                lambda: supabase.table("promotions").select("*").in_("status", ["sent", "sending"]).execute()
            )
            
            promos = res.data or []
            
            if promos:
                # BÜTÜN PROMOSYONLARI MİKRO SANİYELER İÇİNDE PARALEL OLARAK İŞLE
                # Sırayla beklemek yerine hepsini aynı anda çalıştırır
                await asyncio.gather(*[_process_promotion(p) for p in promos])
            
            # Önceden her tur 60 saniye bekliyordu, şimdi "anlık" olması için sadece 8 saniye!
            # Hem telegram spam yemez, hem de görüşler inanılmaz hızlı güncellenir.
            await asyncio.sleep(8)
            
        except Exception as e:
            logger.error(f"❌ Anlık Stats Loop Error: {e}")
            await asyncio.sleep(15)
