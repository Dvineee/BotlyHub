
/**
 * BotlyHub V3 - Comprehensive Gateway Bot (Enhanced)
 * Features: Ad Engine, In-Bot Channel Management, Market Highlights, Advanced Guides
 */

const { Telegraf, Markup, session } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

// --- CONFIGURATION ---
const BOT_TOKEN = 'YOUR_BOT_TOKEN_FROM_BOTFATHER';
const MINI_APP_URL = 'https://your-frontend-url.com'; 
const SUPABASE_URL = 'https://ybnxfwqrduuinzgnbymc.supabase.co';
const SUPABASE_KEY = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

const bot = new Telegraf(BOT_TOKEN);
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Use session for state management
bot.use(session());

// --- TEXT TEMPLATES ---
const STRINGS = {
    WELCOME: (name) => `🌟 <b>Merhaba ${name}, BotlyHub'a Hoş Geldin!</b>\n\nTelegram'ın en kapsamlı bot ekosistemindesin. Botlarını yönet, kanallarından gelir elde et ve marketi keşfet.\n\n👇 <b>Hızlı Menü:</b>`,
    GUIDE_MAIN: `📖 <b>BotlyHub Rehberi</b>\n\nSistem hakkında merak ettiğin her şey burada:`,
    GUIDE_FREE: `🆓 <b>Ücretsiz Botlar</b>\n\nMarketimizdeki ücretsiz botları kütüphanene ekleyerek hemen kullanmaya başlayabilirsin. Kanallarına ekleyerek reklam yayınlayabilir ve TON kazanabilirsin.`,
    GUIDE_PAID: `💎 <b>Premium Botlar</b>\n\nPremium botlar; AI analiz, gelişmiş moderasyon ve özel araçlar sunar. Bir kez satın aldığında ömür boyu veya abonelik süresince senin olur.`,
    GUIDE_WALLET: `👛 <b>TON Cüzdan ve Ödemeler</b>\n\nKazandığın tutarları çekmek için Tonkeeper veya MyTonWallet kullanmalısın. Ödemeler her Pazar günü otomatik olarak cüzdanına yansıtılır.`,
    REPORT_PROMPT: `📝 <b>Bilgi Bildir / Geri Bildirim</b>\n\nBir hata mı buldun yoksa yeni bir özellik mi öneriyorsun? Lütfen detaylıca yazıp gönder.`,
};

// --- AD ENGINE ---
async function runAdEngine() {
    try {
        const { data: ads } = await supabase.from('ads').select('*').eq('status', 'sending');
        const { data: channels } = await supabase.from('channels').select('*').eq('is_ad_enabled', true);
        if (!ads || !channels) return;

        for (const ad of ads) {
            for (const channel of channels) {
                try {
                    const keyboard = ad.button_text ? Markup.inlineKeyboard([[Markup.button.url(ad.button_text, ad.button_link)]]) : null;
                    const text = `<b>${ad.title}</b>\n\n${ad.content}`;
                    if (ad.image_url) {
                        await bot.telegram.sendPhoto(channel.telegram_id, ad.image_url, { caption: text, parse_mode: 'HTML', ...keyboard });
                    } else {
                        await bot.telegram.sendMessage(channel.telegram_id, text, { parse_mode: 'HTML', ...keyboard });
                    }
                    await supabase.rpc('increment_ad_reach', { ad_id: ad.id });
                } catch (e) {
                    if (e.message.includes('kicked') || e.message.includes('blocked')) {
                        await supabase.from('channels').update({ is_ad_enabled: false }).eq('id', channel.id);
                    }
                }
            }
        }
    } catch (e) { console.error('Ad Engine Error:', e); }
}
setInterval(runAdEngine, 30 * 60 * 1000);

// --- HELPER FUNCTIONS ---
const getMainMenu = () => Markup.inlineKeyboard([
    [Markup.button.webApp('🏪 Market Uygulamasını Aç', MINI_APP_URL)],
    [Markup.button.callback('👤 Profil & Kanallarım', 'menu_profile')],
    [Markup.button.callback('📚 Rehber', 'menu_guide'), Markup.button.callback('✨ Bot Vitrini', 'menu_market')],
    [Markup.button.callback('📝 Bildirim Yap', 'menu_report'), Markup.button.url('💬 Destek', 'https://t.me/BotlyHubSupport')]
]);

// --- COMMANDS ---
bot.start(async (ctx) => {
    const userId = ctx.from.id.toString();
    await supabase.from('users').upsert({ id: userId, name: ctx.from.first_name, username: ctx.from.username, status: 'Active' });
    return ctx.replyWithHTML(STRINGS.WELCOME(ctx.from.first_name), getMainMenu());
});

// --- CALLBACK HANDLERS ---

// Ana Menüye Dönüş
bot.action('menu_back', (ctx) => ctx.editMessageText(STRINGS.WELCOME(ctx.from.first_name), { parse_mode: 'HTML', ...getMainMenu() }));

// Rehber Menüsü
bot.action('menu_guide', (ctx) => {
    return ctx.editMessageText(STRINGS.GUIDE_MAIN, {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
            [Markup.button.callback('🆓 Ücretsiz Botlar', 'guide_free'), Markup.button.callback('💎 Premium Botlar', 'guide_paid')],
            [Markup.button.callback('👛 Cüzdan & Ödeme', 'guide_wallet'), Markup.button.callback('💰 Nasıl Kazanırım?', 'guide_earn')],
            [Markup.button.callback('⬅️ Ana Menü', 'menu_back')]
        ])
    });
});

bot.action('guide_free', (ctx) => ctx.editMessageText(STRINGS.GUIDE_FREE, { parse_mode: 'HTML', ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Geri', 'menu_guide')]]) }));
bot.action('guide_paid', (ctx) => ctx.editMessageText(STRINGS.GUIDE_PAID, { parse_mode: 'HTML', ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Geri', 'menu_guide')]]) }));
bot.action('guide_wallet', (ctx) => ctx.editMessageText(STRINGS.GUIDE_WALLET, { parse_mode: 'HTML', ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Geri', 'menu_guide')]]) }));
bot.action('guide_earn', (ctx) => ctx.editMessageText(`💰 <b>Kazanç Sistemi</b>\n\n1. Botu kanalına yönetici yap.\n2. Profil menüsünden 'Reklam Modu'nu aktif et.\n3. Bot reklam yayınladıkça kazancın birikir.\n4. Cüzdanını Mini App üzerinden bağla.`, { parse_mode: 'HTML', ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Geri', 'menu_guide')]]) }));

// Profil ve Kanal Yönetimi
bot.action('menu_profile', async (ctx) => {
    const userId = ctx.from.id.toString();
    const { count: botsCount } = await supabase.from('user_bots').select('*', { count: 'exact', head: true }).eq('user_id', userId);
    const { data: channels } = await supabase.from('channels').select('*').eq('user_id', userId);
    const totalRev = channels?.reduce((acc, curr) => acc + (curr.revenue || 0), 0) || 0;

    const profileText = `👤 <b>Profil Paneli</b>\n\n` +
                        `🆔 ID: <code>${userId}</code>\n` +
                        `🤖 Botların: <b>${botsCount || 0}</b>\n` +
                        `📢 Kanalların: <b>${channels?.length || 0}</b>\n` +
                        `💰 Toplam Kazanç: <b>₺${totalRev.toFixed(2)}</b>\n\n` +
                        `👇 Kanallarını aşağıdan yönetebilirsin:`;

    const channelButtons = (channels || []).map(c => [
        Markup.button.callback(`${c.is_ad_enabled ? '✅' : '❌'} ${c.name}`, `toggle_ad_${c.id}`)
    ]);

    return ctx.editMessageText(profileText, {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
            ...channelButtons,
            [Markup.button.webApp('⚙️ Tüm Detaylar', MINI_APP_URL)],
            [Markup.button.callback('⬅️ Ana Menü', 'menu_back')]
        ])
    });
});

// Kanal Reklam Modu Toggle
bot.action(/^toggle_ad_(.+)$/, async (ctx) => {
    const channelId = ctx.match[1];
    const { data: channel } = await supabase.from('channels').select('is_ad_enabled').eq('id', channelId).single();
    if (channel) {
        const newStatus = !channel.is_ad_enabled;
        await supabase.from('channels').update({ is_ad_enabled: newStatus }).eq('id', channelId);
        ctx.answerCbQuery(`Reklam Modu: ${newStatus ? 'AÇIK ✅' : 'KAPALI ❌'}`);
        // Menüyü yenile
        return ctx.editMessageReplyMarkup(ctx.update.callback_query.message.reply_markup);
    }
});

// Market Vitrini (Top Bots)
bot.action('menu_market', async (ctx) => {
    const { data: bots } = await supabase.from('bots').select('*').limit(3).order('price', { ascending: false });
    let marketText = `✨ <b>Haftanın Öne Çıkanları</b>\n\nEn popüler botlarımızı keşfet:\n\n`;
    
    const botButtons = [];
    if (bots) {
        bots.forEach(b => {
            marketText += `• <b>${b.name}</b> - ${b.price > 0 ? b.price + ' TL' : 'Ücretsiz'}\n`;
            botButtons.push([Markup.button.callback(`ℹ️ ${b.name} Detay`, `bot_info_${b.id}`)]);
        });
    }

    return ctx.editMessageText(marketText, {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
            ...botButtons,
            [Markup.button.webApp('🏪 Tüm Marketi Gör', MINI_APP_URL)],
            [Markup.button.callback('⬅️ Ana Menü', 'menu_back')]
        ])
    });
});

// Bot Detay Bilgisi (callback tabanlı)
bot.action(/^bot_info_(.+)$/, async (ctx) => {
    const botId = ctx.match[1];
    const { data: b } = await supabase.from('bots').select('*').eq('id', botId).single();
    if (b) {
        const detailText = `🤖 <b>${b.name}</b>\n\n${b.description}\n\n💰 Fiyat: ${b.price > 0 ? b.price + ' TL' : 'Ücretsiz'}`;
        return ctx.editMessageText(detailText, {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([
                [Markup.button.url('🔗 Botu İncele', b.bot_link)],
                [Markup.button.callback('⬅️ Vitrine Dön', 'menu_market')]
            ])
        });
    }
});

// Bildirim Akışı
bot.action('menu_report', (ctx) => {
    ctx.session = { step: 'waiting_report' };
    return ctx.replyWithHTML(STRINGS.REPORT_PROMPT, Markup.inlineKeyboard([[Markup.button.callback('❌ Vazgeç', 'menu_back')]]));
});

bot.on('text', async (ctx) => {
    if (ctx.session?.step === 'waiting_report') {
        const report = ctx.message.text;
        const userId = ctx.from.id.toString();

        await supabase.from('activity_logs').insert({
            user_id: userId,
            type: 'system',
            action_key: 'USER_REPORT',
            title: 'Bot Kullanıcı Bildirimi',
            description: report,
            metadata: { username: ctx.from.username, source: 'Telegram_Bot' }
        });

        ctx.session.step = null;
        return ctx.reply("✅ Bildirimin editörlerimize iletildi. Katkın için teşekkürler!", getMainMenu());
    }
});

// Discovery (Kanal Ekleme)
bot.on('my_chat_member', async (ctx) => {
    const chat = ctx.myChatMember.chat;
    const status = ctx.myChatMember.new_chat_member.status;
    if (status === 'administrator') {
        const count = await ctx.getChatMembersCount();
        await supabase.from('bot_discovery_logs').insert({
            owner_id: ctx.myChatMember.from.id.toString(),
            bot_id: ctx.botInfo.id.toString(),
            chat_id: chat.id.toString(),
            channel_name: chat.title,
            member_count: count,
            is_synced: false
        });
        await bot.telegram.sendMessage(ctx.myChatMember.from.id, `✅ <b>${chat.title}</b> eklendi! Reklam kazançlarını başlatmak için profil menüsünden reklam modunu açmayı unutma.`);
    }
});

bot.launch().then(() => console.log('>>> BotlyHub V3 (Enhanced) Online!'));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
