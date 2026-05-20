import asyncio
from aiogram import types
from aiogram.utils.keyboard import InlineKeyboardBuilder
from core.bot import bot, supabase
from core.config import logger, UTCNOW

async def ad_dispatcher_task():
    while True:
        try:
            # 1. Aktif reklamları çek
            res = supabase.table("promotions").select("*").execute()
            all_promos = res.data or []
            sending_promos = [p for p in all_promos if p.get("status") == "sending"]
            
            if not sending_promos:
                logger.info(f"📭 Aktif reklam yok (Toplam reklam: {len(all_promos)})")
                if all_promos:
                    statuses = [p.get("status") for p in all_promos]
                    logger.info(f"📊 Mevcut durumlar: {dict((x, statuses.count(x)) for x in set(statuses))}")
                await asyncio.sleep(20)
                continue

            promos = sending_promos
            logger.info(f"🚀 {len(promos)} adet aktif reklam işleniyor...")

            # 2. Reklam alabilecek kanalları çek
            channels = supabase.table("channels") \
                .select("*") \
                .eq("revenue_enabled", True) \
                .eq("archived", False) \
                .execute().data or []

            for promo in promos:
                source_channel = promo.get("source_channel")
                source_msg_id = promo.get("source_message_id")
                processed = set(promo.get("processed_channels") or [])
                reach = int(promo.get("total_reach") or 0)
                
                # 1. ADIM: ANA KANALA PAYLAŞIM (ZORUNLU)
                if source_channel and not source_msg_id:
                    try:
                        source_chat = await bot.get_chat(source_channel)
                        source_username = source_chat.username
                        
                        if not source_username and str(source_channel) != "-1003826684282":
                            logger.warning(f"⚠️ [KRİTİK UYARI] Ana kanal ({source_channel}) GİZLİ (PRIVATE). "
                                           f"İstatistik takibi (scraping) çalışmayacaktır. "
                                           f"Lütfen istatistikler için ana kanalı KAMUYA AÇIK (PUBLIC) yapın "
                                           f"ve bir @username atayın.")

                        logger.info(f"📢 Ana kanala paylaşılıyor: {source_channel}")
                        kb = InlineKeyboardBuilder()
                        if promo.get("button_text") and promo.get("button_link"):
                            kb.row(types.InlineKeyboardButton(text=promo["button_text"], url=promo["button_link"]))

                        caption = f"<b>{promo['title']}</b>\n\n{promo['content']}"
                        sent = None
                        
                        if promo.get("image_url"):
                            sent = await bot.send_photo(chat_id=source_channel, photo=promo["image_url"], caption=caption, parse_mode="HTML", reply_markup=kb.as_markup())
                        else:
                            sent = await bot.send_message(chat_id=source_channel, text=caption, parse_mode="HTML", reply_markup=kb.as_markup())

                        if sent:
                            source_msg_id = sent.message_id
                            update_data = {"source_message_id": source_msg_id}
                                
                            supabase.table("promotions").update(update_data).eq("id", promo["id"]).execute()
                            logger.info(f"✅ Ana kanal paylaşımı başarılı. ID: {source_msg_id}")
                            
                            # Log to bot_logs for visibility in admin panel
                            supabase.table("bot_logs").insert({
                                "user_id": "admin",
                                "type": "bot",
                                "action_key": f"promo_start_{promo['id']}",
                                "title": "Reklam Dağıtımı Başladı",
                                "description": f"'{promo['title']}' reklamı ana kanalda paylaşıldı ve dağıtım süreci başladı.",
                                "created_at": UTCNOW()
                            }).execute()
                    except Exception as e:
                        logger.error(f"❌ Ana kanal paylaşım hatası ({source_channel}): {e}")
                        continue # Ana kanala paylaşılamazsa ilerleyemeyiz

                if not source_channel or not source_msg_id:
                    logger.warning(f"⚠️ Reklam atlanıyor: Ana kanal veya Mesaj ID eksik ({promo['title']})")
                    continue

                # 2. ADIM: DİĞER KANALLARA ÖZEL POST OLUŞTUR VE İLET (ZORUNLU)
                newly_processed = 0
                for ch in channels:
                    tg_id = str(ch["telegram_id"])
                    
                    if tg_id == str(source_channel) or tg_id in processed:
                        continue

                    try:
                        kb = InlineKeyboardBuilder()
                        if promo.get("button_text") and promo.get("button_link"):
                            kb.row(types.InlineKeyboardButton(text=promo["button_text"], url=promo["button_link"]))
                        
                        caption = f"<b>{promo['title']}</b>\n\n{promo['content']}"
                        
                        unique_source_msg = None
                        if promo.get("image_url"):
                            unique_source_msg = await bot.send_photo(chat_id=source_channel, photo=promo["image_url"], caption=caption, parse_mode="HTML", reply_markup=kb.as_markup())
                        else:
                            unique_source_msg = await bot.send_message(chat_id=source_channel, text=caption, parse_mode="HTML", reply_markup=kb.as_markup())

                        if unique_source_msg:
                            sent_msg = await bot.forward_message(chat_id=tg_id, from_chat_id=source_channel, message_id=unique_source_msg.message_id)
                            
                            if sent_msg:
                                processed.add(tg_id)
                                reach += int(ch.get("member_count") or 0)
                                newly_processed += 1
                                
                                m_map = promo.get("message_map") or {}
                                # Kaydet: hedef kanala iletilen mesajın ID'si (sent_msg.message_id)
                                # Bu sayede istatistik çekerken her hedef kanalın kendi mesajı sorgulanır
                                m_map[tg_id] = sent_msg.message_id
                                
                                supabase.table("promotions").update({
                                    "processed_channels": list(processed),
                                    "total_reach": reach,
                                    "channel_count": len(processed),
                                    "message_map": m_map
                                }).eq("id", promo["id"]).execute()
                                
                                logger.info(f"✅ Özel Post + İletildi -> {ch['name']}")
                        
                        await asyncio.sleep(1.0) # Rate limit koruması
                    except Exception as e:
                        logger.error(f"❌ Özel İletim Hatası ({ch['name']}): {e}")
                        if any(x in str(e).lower() for x in ["kicked", "chat not found", "blocked"]):
                            supabase.table("channels").update({"revenue_enabled": False}).eq("id", ch["id"]).execute()

                # Bitiş kontrolü
                if len(channels) > 0 and len(processed) >= (len(channels) - 1 if source_channel in [c["telegram_id"] for c in channels] else len(channels)):
                    supabase.table("promotions").update({"status": "sent", "sent_at": UTCNOW()}).eq("id", promo["id"]).execute()
                    logger.info(f"🏁 Reklam tamamlandı: {promo['title']}")
                    
                    supabase.table("bot_logs").insert({
                        "user_id": "admin",
                        "type": "bot",
                        "action_key": f"promo_end_{promo['id']}",
                        "title": "Reklam Dağıtımı Tamamlandı",
                        "description": f"'{promo['title']}' reklamı tüm kanallara başarıyla dağıtıldı.",
                        "created_at": UTCNOW()
                    }).execute()

        except Exception:
            logger.exception("🔥 Dispatcher error")

        await asyncio.sleep(20)

