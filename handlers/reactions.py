from aiogram import Router, types
from core.bot import supabase
from core.config import logger, UTCNOW

router = Router()

@router.message_reaction()
async def on_reaction_update(event: types.MessageReactionUpdated):
    """Reklam mesajlarına verilen tepkileri yakalar ve kaydeder"""
    chat_id = str(event.chat.id)
    msg_id = event.message_id
    user = event.user
    user_id = str(user.id) if user else "anonymous"
    user_name = user.full_name if user else "Anonim"
    
    new_reacts = [r.emoji for r in event.new_reaction if r.type == "emoji"]
    custom_reacts = [r.custom_emoji_id for r in event.new_reaction if r.type == "custom_emoji"]
    all_reacts = new_reacts + custom_reacts
    
    if not all_reacts:
        logger.info(f"🗑️ Tepki kaldırıldı | User: {user_name} ({user_id}) | Msg: {msg_id}")
        return

    logger.info(f"❤️ Tepki algılandı | User: {user_name} | Msg: {msg_id} | Reacts: {all_reacts}")
    
    try:
        res = supabase.table("promotions") \
            .select("id, title, message_map") \
            .in_("status", ["sent", "sending"]) \
            .order("created_at", desc=True) \
            .limit(50) \
            .execute()
        
        promo_id = None
        promo_title = "Bilinmeyen Reklam"
        
        for p in res.data or []:
            m_map = p.get("message_map") or {}
            if m_map.get(chat_id) == msg_id:
                promo_id = p["id"]
                promo_title = p["title"]
                break
        
        if promo_id:
            supabase.table("bot_logs").insert({
                "user_id": user_id,
                "type": "ad_reaction",
                "action_key": f"react_{promo_id}_{msg_id}",
                "title": "Reklam Tepkisi",
                "description": f"'{user_name}' kullanıcısı '{promo_title}' reklamına tepki verdi: {', '.join(all_reacts)}",
                "created_at": UTCNOW()
            }).execute()
            
            logger.info(f"✅ Tepki veritabanına kaydedildi: {promo_title}")
            
    except Exception as e:
        logger.error(f"❌ Tepki kayıt hatası: {e}")
