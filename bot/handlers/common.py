import logging
from aiogram import Router, types, F
from aiogram.filters import Command
import os

router = Router()

@router.message(Command("help"))
@router.message(Command("yardim"))
@router.message(F.text == "ℹ️ Bilgi")
async def cmd_help(message: types.Message):
    help_text = (
        "🤖 *BotlyHub Yardım Servisi*\n\n"
        "Komutlar:\n"
        "🚀 /start - Botu başlatır ve ana menüyü gösterir\n"
        "👤 /account - Hesap ve cüzdan bilgilerinizi gösterir\n"
        "🔍 /search - Bot kütüphanesinde arama yapar\n"
        "ℹ️ /help - Bu yardım mesajını gösterir\n\n"
        "🔗 *Bağlantılar:*\n"
        "🌐 [Web Sitemiz](https://botlyhub.com)\n"
        "📢 [Duyurular](https://t.me/BotlyHub)\n"
        "👥 [Destek](https://t.me/BotlyHubSupport)"
    )
    await message.answer(help_text, parse_mode="Markdown", disable_web_page_preview=True)

@router.callback_query(F.data == "view_rewards")
async def callback_rewards(callback: types.CallbackQuery):
    reward_text = (
        "🎁 *Ödül Sistemi*\n\n"
        "Arkadaşlarınızı davet ederek Hub Puanı kazanabilirsiniz:\n"
        "• Standart Üye: 100 Hub Puanı\n"
        "• Premium Üye: 500 Hub Puanı\n\n"
        "Puanlarınızı markette harcayabilir veya ödeme alabilirsiniz."
    )
    await callback.message.answer(reward_text, parse_mode="Markdown")
    await callback.answer()
