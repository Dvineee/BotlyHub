import asyncio
import datetime
from datetime import timezone
from aiogram import F, Router, types
from aiogram.filters import Command, CommandStart, CommandObject
from aiogram.types import ChatMemberUpdated
from aiogram.utils.keyboard import InlineKeyboardBuilder
from core.bot import bot, supabase
from core.config import MINI_APP_URL, UTCNOW, logger

router = Router()

TARGET_GROUP_ID = "-1003360909133"
BOT_USERNAME = None


def normalize_group_id(group_id):
    if group_id is None:
        return TARGET_GROUP_ID
    return str(group_id)


def get_referral_link(user_id: str) -> str:
    if BOT_USERNAME:
        return f"https://t.me/{BOT_USERNAME}?start=ref_{user_id}"
    return f"https://t.me/BotlyHub?start=ref_{user_id}"


async def notify_referrer(referrer_id: str, text: str) -> bool:
    try:
        await bot.send_message(referrer_id, text, parse_mode="HTML")
        return True
    except Exception as e:
        logger.warning(f"Referans sahibine mesaj gönderilemedi: {e}")
        return False


async def process_referral_reward(referrer_id, referred_id, ref_id, reward, referred_name: str = None):
    try:
        supabase.table("referrals").update({
            "status": "confirmed",
            "confirmed_at": UTCNOW()
        }).eq("id", ref_id).execute()

        wallet_res = supabase.table("user_wallets").select("*").eq("user_id", referrer_id).execute()
        if wallet_res and hasattr(wallet_res, "data") and wallet_res.data:
            wallet = wallet_res.data[0]
            new_balance = (wallet.get("balance") or 0) + reward
            new_total = (wallet.get("total_earned") or 0) + reward
            supabase.table("user_wallets").update({
                "balance": new_balance,
                "total_earned": new_total,
                "updated_at": UTCNOW()
            }).eq("user_id", referrer_id).execute()
        else:
            supabase.table("user_wallets").insert({
                "user_id": referrer_id,
                "balance": reward,
                "total_earned": reward,
                "created_at": UTCNOW()
            }).execute()

        referred_display = referred_name or str(referred_id)
        try:
            await bot.send_message(
                referrer_id,
                f"✅ <b>Tebrikler! Referans Ödülü!</b>\n\nDavet ettiğiniz <b>{referred_display}</b> gruba katıldı. <b>{reward} TRY</b> ödülünüz cüzdanınıza eklendi.",
                parse_mode="HTML"
            )
        except Exception as send_err:
            logger.warning(f"Referans ödülü bildirimi gönderilemedi: {send_err}")

        return True
    except Exception as e:
        logger.error(f"❌ Referans ödül işleme hatası: {e}")
        return False


@router.message(CommandStart(), F.chat.type == "private")
async def start_handler(msg: types.Message, command: CommandObject):
    uid = str(msg.from_user.id)
    args = command.args
    logger.info(f"🚀 Referans /start alındı | User: {uid} | Args: {args}")

    try:
        user_res = supabase.table("users").select("id").eq("id", uid).execute()
        is_first_start = not (user_res and hasattr(user_res, "data") and user_res.data)
    except Exception as e:
        logger.error(f"User sorgulama hatası: {e}")
        is_first_start = True

    try:
        supabase.table("users").upsert({
            "id": uid,
            "name": msg.from_user.full_name,
            "username": msg.from_user.username,
            "status": "Active",
            "joindate": UTCNOW()
        }).execute()
    except Exception as e:
        logger.error(f"User upsert hatası: {e}")

    if is_first_start and args and args.startswith("ref_"):
        referrer_id = args.replace("ref_", "").strip()
        if referrer_id.isdigit() and referrer_id != uid:
            referrer_id_int = int(referrer_id)
            uid_int = int(uid)

            try:
                res = supabase.table("referrals").select("*").eq("referred_id", uid_int).execute()
                existing = res.data if (res and hasattr(res, "data")) else []

                settings_res = supabase.table("referral_settings").select("*").eq("id", 1).execute()
                settings = settings_res.data[0] if (settings_res and hasattr(settings_res, "data") and settings_res.data) else {"standard_reward": 10, "group_id": TARGET_GROUP_ID}

                target_group = normalize_group_id(settings.get("group_id", TARGET_GROUP_ID))
                reward = int(settings.get("standard_reward", 10) or 10)

                is_in_group = False
                try:
                    member = await bot.get_chat_member(target_group, uid)
                    if member.status in ("member", "administrator", "creator"):
                        is_in_group = True
                except Exception as e:
                    logger.debug(f"Üyelik kontrolü başarısız: {e}")

                if not existing:
                    status = "confirmed" if is_in_group else "pending"
                    new_ref = supabase.table("referrals").insert({
                        "referrer_id": referrer_id_int,
                        "referred_id": uid_int,
                        "status": status,
                        "reward_amount": reward,
                        "ip_address": "Bot",
                        "device_fingerprint": "Bot",
                        "is_premium_refer": False,
                        "created_at": UTCNOW(),
                        "confirmed_at": UTCNOW() if is_in_group else None
                    }).execute()
                    if hasattr(new_ref, "error") and new_ref.error:
                        logger.error(f"Referans ekleme hatası: {new_ref.error}")

                    supabase.table("users").update({"referred_by": referrer_id_int}).eq("id", uid).execute()

                    if is_in_group and new_ref and hasattr(new_ref, "data") and new_ref.data:
                        referred_display = f"@{msg.from_user.username}" if msg.from_user.username else msg.from_user.full_name
                        reward_task = asyncio.create_task(process_referral_reward(referrer_id_int, uid_int, new_ref.data[0]["id"], reward, referred_display))
                        answer_task = asyncio.create_task(msg.answer("🎉 Gruba zaten üye olduğunuz için referansınız anında onaylandı!"))
                        await asyncio.gather(reward_task, answer_task)
                    else:
                        referred_display = f"@{msg.from_user.username}" if msg.from_user.username else msg.from_user.full_name
                        notify_task = asyncio.create_task(notify_referrer(
                            referrer_id,
                            f"🔔 Bir referansın kaydedildi: {referred_display} tarafından davet edildi.\n" \
                            f"Ödül {reward} TRY olacak ve grup üyeliği onaylandığında size bildirilecek."
                        ))
                        answer_task = asyncio.create_task(msg.answer("✅ Referans kodunuz kaydedildi, grup üyeliği doğrulanmasını bekliyoruz."))
                        results = await asyncio.gather(notify_task, answer_task, return_exceptions=True)
                        notified = results[0] if not isinstance(results[0], Exception) else False

                        if not notified:
                            await msg.answer(
                                "✅ Referans kodunuz kaydedildi. Referans sahibine bildirim gönderilemedi, ancak kayıt veritabanına alındı."
                            )

                elif existing[0].get("status") == "pending" and is_in_group:
                    referred_display = f"@{msg.from_user.username}" if msg.from_user.username else msg.from_user.full_name
                    reward_task = asyncio.create_task(process_referral_reward(referrer_id_int, uid_int, existing[0]["id"], reward, referred_display))
                    answer_task = asyncio.create_task(msg.answer("✅ Grubumuza katıldığınız tespit edildi, referans ödülünüz onaylandı!"))
                    await asyncio.gather(reward_task, answer_task, return_exceptions=True)

            except Exception as e:
                logger.error(f"Referans işleme hatası: {e}")

    kb = InlineKeyboardBuilder()
    ref_link = get_referral_link(uid)

    if msg.chat.type == "private":
        clean_url = MINI_APP_URL.strip().rstrip('/')
        kb.row(types.InlineKeyboardButton(text="🚀 Mağazayı Aç", web_app=types.WebAppInfo(url=clean_url)))
        kb.row(types.InlineKeyboardButton(text="🔗 Referans Linkini Aç", url=ref_link))
        message_text = (
            f"👋 <b>Merhaba {msg.from_user.first_name}!</b>\n\n"
            "BotlyHub'e hoş geldin. Aşağıdaki butonlardan devam edebilirsin."
        )
    else:
        kb.row(types.InlineKeyboardButton(text="🌐 Web Sitesine Git", url=MINI_APP_URL))
        message_text = (
            f"👋 <b>Merhaba {msg.from_user.first_name}!</b>\n\n"
            "BotlyHub'e hoş geldin. Aşağıdaki butondan web sitesine gidebilirsin."
        )

    try:
        await msg.answer(
            message_text,
            reply_markup=kb.as_markup(),
            parse_mode="HTML"
        )
    except Exception as e:
        logger.error(f"Start mesajı gönderilemedi: {e}")


@router.message(Command(commands=["ref", "myref", "referral"]), F.chat.type == "private")
async def referral_link_handler(msg: types.Message):
    uid = str(msg.from_user.id)
    ref_link = get_referral_link(uid)
    kb = InlineKeyboardBuilder()
    kb.row(types.InlineKeyboardButton(text="🔗 Referans Linkini Aç", url=ref_link))

    try:
        await msg.answer(
            f"🔁 <b>Referans Linkin Hazır!</b>\n\n"
            f"{ref_link}\n\n"
            "Bu linkle gelen kullanıcılar gruba katıldığında ödül kazanırsın.",
            reply_markup=kb.as_markup(),
            parse_mode="HTML"
        )
    except Exception as e:
        logger.error(f"Referans komut hata: {e}")


@router.chat_member()
async def group_join_handler(event: ChatMemberUpdated):
    if event.new_chat_member.status in ("member", "administrator", "creator"):
        uid = str(event.new_chat_member.user.id)
        chat_id = str(event.chat.id)
        try:
            settings_res = supabase.table("referral_settings").select("group_id").eq("id", 1).execute()
            target_group = normalize_group_id(settings_res.data[0]["group_id"] if (settings_res and hasattr(settings_res, "data") and settings_res.data) else TARGET_GROUP_ID)

            if chat_id == target_group:
                ref_res = supabase.table("referrals").select("*").eq("referred_id", uid).eq("status", "pending").execute()
                if ref_res and hasattr(ref_res, "data") and ref_res.data:
                    referred_display = f"@{event.new_chat_member.user.username}" if event.new_chat_member.user.username else event.new_chat_member.user.full_name
                    tasks = [asyncio.create_task(process_referral_reward(ref["referrer_id"], uid, ref["id"], ref["reward_amount"], referred_display)) for ref in ref_res.data]
                    results = await asyncio.gather(*tasks, return_exceptions=True)
                    for result in results:
                        if isinstance(result, Exception):
                            logger.error(f"Referans ödülü işleme görevinde hata: {result}")
        except Exception as e:
            logger.error(f"Grup katılım takibi hatası: {e}")
