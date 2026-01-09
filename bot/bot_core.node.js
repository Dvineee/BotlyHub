
/**
 * BotlyHub V3 - Advanced Ad Engine & Gateway
 * Logic: Sequential delivery with "Already Sent" prevention.
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

// --- AD ENGINE (DYNAMİC SEQUENTIAL DELIVERY) ---
async function runAdEngine() {
    try {
        // 1. Yayın bekleyen reklamları çek
        const { data: ads } = await supabase.from('ads').select('*').eq('status', 'sending');
        if (!ads || ads.length === 0) return;

        // 2. Reklam yayın modu açık olan kanalları çek
        const { data: channels } = await supabase.from('channels').select('*').eq('is_ad_enabled', true);
        if (!channels || channels.length === 0) return;

        for (const ad of ads) {
            let reachedCount = ad.channel_count || 0;
            let totalReach = ad.total_reach || 0;
            // process_channels alanını bir set olarak alıyoruz (mükerrer gönderim önleyici)
            const processed = new Set(ad.processed_channels || []);

            console.log(`[AdEngine] Processing ad ${ad.id} for ${channels.length} channels...`);

            for (const channel of channels) {
                // Eğer bu reklam bu kanala zaten gönderilmişse atla
                if (processed.has(channel.telegram_id)) continue;

                try {
                    const keyboard = ad.button_text && ad.button_link 
                        ? Markup.inlineKeyboard([[Markup.button.url(ad.button_text, ad.button_link)]]) 
                        : null;
                    const text = `<b>${ad.title}</b>\n\n${ad.content}`;
                    
                    let sentMsg;
                    if (ad.image_url) {
                        sentMsg = await bot.telegram.sendPhoto(channel.telegram_id, ad.image_url, { 
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
                        
                        // Her gönderimde veritabanını güncelle (canlı ilerleme için)
                        await supabase.from('ads').update({ 
                            channel_count: reachedCount, 
                            total_reach: totalReach,
                            processed_channels: Array.from(processed)
                        }).eq('id', ad.id);
                    }

                    // Flood limitine takılmamak için bekleme
                    await new Promise(r => setTimeout(r, 200)); 

                } catch (e) {
                    const errMsg = e.message.toLowerCase();
                    // Bot kanaldan atılmışsa veya kanal kapalıysa
                    if (errMsg.includes('kicked') || errMsg.includes('blocked') || errMsg.includes('chat not found')) {
                        console.log(`[AdEngine] Disabling channel ${channel.name} due to error.`);
                        await supabase.from('channels').update({ is_ad_enabled: false }).eq('id', channel.id);
                    }
                }
            }
            
            // Eğer tüm kanallar işlendiyse statüyü tamamla
            // (Not: Yeni kanallar eklendiğinde 'sending'e geri çekilebilir)
            if (processed.size >= channels.length) {
                await supabase.from('ads').update({ status: 'sent' }).eq('id', ad.id);
                console.log(`[AdEngine] Ad ${ad.id} finished successfully.`);
            }
        }
    } catch (e) { console.error('[AdEngine Error]:', e); }
}

// Reklam motorunu her 1 dakikada bir çalıştır (Admin panelinden basıldığında hemen tepki vermesi için)
setInterval(runAdEngine, 60 * 1000);

// --- TEST AD ENGINE ---
async function listenForTestRequests() {
    supabase.channel('test_ads')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs', filter: 'action_key=eq.TEST_AD_REQUEST' }, async (payload) => {
            const { adId, adminTelegramId } = payload.new.metadata;
            const { data: ad } = await supabase.from('ads').select('*').eq('id', adId).single();
            if (!ad) return;

            try {
                const keyboard = ad.button_text ? Markup.inlineKeyboard([[Markup.button.url(ad.button_text, ad.button_link)]]) : null;
                const text = `🛠 <b>PREVIEW (TEST)</b>\n\n<b>${ad.title}</b>\n\n${ad.content}`;
                if (ad.image_url) {
                    await bot.telegram.sendPhoto(adminTelegramId, ad.image_url, { caption: text, parse_mode: 'HTML', ...keyboard });
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
    return ctx.replyWithHTML(`🌟 <b>BotlyHub V3 Hoş Geldin!</b>\n\nReklam gelirlerini yönetmek için kanallarım menüsüne bakabilirsin.`, getMainMenu());
});

bot.action('menu_profile', async (ctx) => {
    const userId = ctx.from.id.toString();
    const { data: channels } = await supabase.from('channels').select('*').eq('user_id', userId);
    const profileText = `👤 <b>Profil ve Kanallar</b>\n\nToplam Kanal: <b>${channels?.length || 0}</b>`;
    const channelButtons = (channels || []).slice(0, 5).map(c => [
        Markup.button.callback(`${c.is_ad_enabled ? '✅' : '❌'} ${c.name}`, `toggle_ad_${c.id}`)
    ]);
    return ctx.editMessageText(profileText, {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([...channelButtons, [Markup.button.callback('⬅️ Geri', 'menu_back')]])
    });
});

bot.action(/^toggle_ad_(.+)$/, async (ctx) => {
    const channelId = ctx.match[1];
    const { data: channel } = await supabase.from('channels').select('is_ad_enabled').eq('id', channelId).single();
    if (channel) {
        const newStatus = !channel.is_ad_enabled;
        await supabase.from('channels').update({ is_ad_enabled: newStatus }).eq('id', channelId);
        ctx.answerCbQuery(`Reklam: ${newStatus ? 'AÇIK' : 'KAPALI'}`);
        return ctx.editMessageReplyMarkup(ctx.update.callback_query.message.reply_markup);
    }
});

bot.action('menu_back', (ctx) => ctx.editMessageText('🌟 <b>BotlyHub Menü</b>', { parse_mode: 'HTML', ...getMainMenu() }));

bot.launch().then(() => console.log('>>> BotlyHub V3 Core Online!'));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
