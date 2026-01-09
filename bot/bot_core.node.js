
/**
 * BotlyHub V3 - Advanced Promotion Engine & Gateway
 * Logic: Sequential delivery with "Already Sent" prevention.
 * Table: Promotions (Renamed from ads to avoid AdBlocker filtering)
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

bot.use(session());

// --- PROMOTION ENGINE (DYNAMİC SEQUENTIAL DELIVERY) ---
async function runPromotionEngine() {
    try {
        // 1. Yayın bekleyen tanıtımları çek (Sadece "sending" olanlar)
        const { data: promotions } = await supabase.from('promotions').select('*').eq('status', 'sending');
        if (!promotions || promotions.length === 0) return;

        // 2. Tanıtım yayın modu açık olan kanalları çek
        const { data: channels } = await supabase.from('channels').select('*').eq('is_ad_enabled', true);
        if (!channels || channels.length === 0) return;

        for (const promo of promotions) {
            let reachedCount = promo.channel_count || 0;
            let totalReach = promo.total_reach || 0;
            const processed = new Set(promo.processed_channels || []);

            console.log(`[PromoEngine] Processing promo ${promo.id} for ${channels.length} channels...`);

            for (const channel of channels) {
                // Eğer bu tanıtım bu kanala zaten gönderilmişse atla
                if (processed.has(channel.telegram_id)) continue;

                try {
                    const keyboard = promo.button_text && promo.button_link 
                        ? Markup.inlineKeyboard([[Markup.button.url(promo.button_text, promo.button_link)]]) 
                        : null;
                    const text = `<b>${promo.title}</b>\n\n${promo.content}`;
                    
                    let sentMsg;
                    if (promo.image_url) {
                        sentMsg = await bot.telegram.sendPhoto(channel.telegram_id, promo.image_url, { 
                            caption: text, 
                            parse_mode: 'HTML', 
                            ...keyboard 
                        });
                    } else {
                        sentMsg = await bot.telegram.sendMessage(channel.telegram_id, text, { 
                            parse_mode: 'HTML', 
                            ...keyboard 
                        });
                    }

                    if (sentMsg) {
                        reachedCount++;
                        totalReach += (channel.member_count || 0);
                        processed.add(channel.telegram_id);
                        
                        // Her gönderimde veritabanını anlık güncelle
                        await supabase.from('promotions').update({ 
                            channel_count: reachedCount, 
                            total_reach: totalReach,
                            processed_channels: Array.from(processed)
                        }).eq('id', promo.id);
                    }

                    // Flood limitine takılmamak için kısa bekleme
                    await new Promise(r => setTimeout(r, 250)); 

                } catch (e) {
                    const errMsg = e.message.toLowerCase();
                    // Bot kanaldan atılmışsa veya kanal bulunamıyorsa kanalı pasife al
                    if (errMsg.includes('kicked') || errMsg.includes('blocked') || errMsg.includes('chat not found') || errMsg.includes('forbidden')) {
                        console.log(`[PromoEngine] Disabling channel ${channel.name} due to error: ${errMsg}`);
                        await supabase.from('channels').update({ is_ad_enabled: false }).eq('id', channel.id);
                    }
                }
            }
            
            // Eğer tüm aktif kanallara gönderim bittiyse statüyü tamamla
            if (processed.size >= channels.length) {
                await supabase.from('promotions').update({ status: 'sent' }).eq('id', promo.id);
                console.log(`[PromoEngine] Promotion ${promo.id} finished successfully.`);
            }
        }
    } catch (e) { console.error('[PromoEngine Error]:', e); }
}

// Reklam motorunu her 30 saniyede bir kontrol et (Daha akıcı yayın için)
setInterval(runPromotionEngine, 30 * 1000);

// --- TEST ENGINE (INSTANT PREVIEW) ---
async function listenForTestRequests() {
    supabase.channel('test_promotions')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs', filter: 'action_key=eq.TEST_PROMO_REQUEST' }, async (payload) => {
            const { promoId, adminTelegramId } = payload.new.metadata;
            const { data: promo } = await supabase.from('promotions').select('*').eq('id', promoId).single();
            if (!promo) return;

            try {
                const keyboard = promo.button_text ? Markup.inlineKeyboard([[Markup.button.url(promo.button_text, promo.button_link)]]) : null;
                const text = `🛠 <b>PREVIEW (TEST MODE)</b>\n\n<b>${promo.title}</b>\n\n${promo.content}`;
                if (promo.image_url) {
                    await bot.telegram.sendPhoto(adminTelegramId, promo.image_url, { caption: text, parse_mode: 'HTML', ...keyboard });
                } else {
                    await bot.telegram.sendMessage(adminTelegramId, text, { parse_mode: 'HTML', ...keyboard });
                }
            } catch (e) { console.error('[TestEngine Error]:', e); }
        })
        .subscribe();
}
listenForTestRequests();

// --- BOT INTERFACE ---
const getMainMenu = () => Markup.inlineKeyboard([
    [Markup.button.webApp('🏪 Market Uygulamasını Aç', MINI_APP_URL)],
    [Markup.button.callback('👤 Profil & Kanallarım', 'menu_profile')],
    [Markup.button.callback('📚 Rehber', 'menu_guide')],
    [Markup.button.url('💬 Destek', 'https://t.me/BotlyHubSupport')]
]);

bot.start(async (ctx) => {
    const userId = ctx.from.id.toString();
    await supabase.from('users').upsert({ id: userId, name: ctx.from.first_name, username: ctx.from.username, status: 'Active' });
    return ctx.replyWithHTML(`🌟 <b>BotlyHub V3 Hoş Geldin!</b>\n\nTanıtım ve gelir yönetimini uygulama üzerinden yapabilirsin.`, getMainMenu());
});

bot.action('menu_profile', async (ctx) => {
    const userId = ctx.from.id.toString();
    const { data: channels } = await supabase.from('channels').select('*').eq('user_id', userId);
    const profileText = `👤 <b>Profil ve Kanallar</b>\n\n🆔 ID: <code>${userId}</code>\n📢 Toplam Kanal: <b>${channels?.length || 0}</b>`;
    const channelButtons = (channels || []).slice(0, 5).map(c => [
        Markup.button.callback(`${c.is_ad_enabled ? '✅' : '❌'} ${c.name}`, `toggle_ad_${c.id}`)
    ]);
    return ctx.editMessageText(profileText, {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([...channelButtons, [Markup.button.webApp('⚙️ Detaylı Yönetim', MINI_APP_URL)], [Markup.button.callback('⬅️ Geri', 'menu_back')]])
    });
});

bot.action(/^toggle_ad_(.+)$/, async (ctx) => {
    const channelId = ctx.match[1];
    const { data: channel } = await supabase.from('channels').select('is_ad_enabled').eq('id', channelId).single();
    if (channel) {
        const newStatus = !channel.is_ad_enabled;
        await supabase.from('channels').update({ is_ad_enabled: newStatus }).eq('id', channelId);
        ctx.answerCbQuery(`Reklam Modu: ${newStatus ? 'AÇIK' : 'KAPALI'}`);
        return ctx.editMessageReplyMarkup(ctx.update.callback_query.message.reply_markup);
    }
});

bot.action('menu_back', (ctx) => ctx.editMessageText('🌟 <b>BotlyHub Menü</b>', { parse_mode: 'HTML', ...getMainMenu() }));

bot.launch().then(() => console.log('>>> BotlyHub V3 Core Online! (AdBlock Resilient Mode)'));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
