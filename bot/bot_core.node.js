
/**
 * BotlyHub V3 - Advanced Ad Engine & Gateway
 * Logic: Optimized sequential delivery, test-mode integration, real-time stats update.
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
        // 1. İşlemdeki reklamları çek (Sadece "sending" olanlar)
        const { data: ads } = await supabase.from('ads').select('*').eq('status', 'sending');
        if (!ads || ads.length === 0) return;

        // 2. Aktif kanalları çek
        const { data: channels } = await supabase.from('channels').select('*').eq('is_ad_enabled', true);
        if (!channels || channels.length === 0) return;

        console.log(`[AdEngine] Processing ${ads.length} active campaigns for ${channels.length} channels...`);

        for (const ad of ads) {
            let reachedCount = ad.channel_count || 0;
            let totalReach = ad.total_reach || 0;

            for (const channel of channels) {
                // Not: Her kanal için gönderim kontrolü eklenebilir (duplicate check)
                try {
                    const keyboard = ad.button_text ? Markup.inlineKeyboard([[Markup.button.url(ad.button_text, ad.button_link)]]) : null;
                    const text = `<b>${ad.title}</b>\n\n${ad.content}`;
                    
                    let sentMsg;
                    if (ad.image_url) {
                        sentMsg = await bot.telegram.sendPhoto(channel.telegram_id, ad.image_url, { caption: text, parse_mode: 'HTML', ...keyboard });
                    } else {
                        sentMsg = await bot.telegram.sendMessage(channel.telegram_id, text, { parse_mode: 'HTML', ...keyboard });
                    }

                    if (sentMsg) {
                        reachedCount++;
                        totalReach += (channel.member_count || 0);
                        
                        // Veritabanında anlık ilerleme güncellemesi
                        await supabase.from('ads').update({ 
                            channel_count: reachedCount, 
                            total_reach: totalReach 
                        }).eq('id', ad.id);
                    }

                    // Hız sınırlamasına (Rate-limit) takılmamak için kısa bekleme
                    await new Promise(r => setTimeout(r, 100)); 

                } catch (e) {
                    // Bot kanaldan atılmışsa kanalı pasife al
                    if (e.message.includes('kicked') || e.message.includes('blocked') || e.message.includes('chat not found')) {
                        console.log(`[AdEngine] Disabling inactive channel: ${channel.name}`);
                        await supabase.from('channels').update({ is_ad_enabled: false }).eq('id', channel.id);
                    }
                }
            }
            
            // Tüm kanallara gönderim bittiyse statüyü "sent" yap
            await supabase.from('ads').update({ status: 'sent' }).eq('id', ad.id);
            console.log(`[AdEngine] Campaign ${ad.id} finished.`);
        }
    } catch (e) { console.error('[AdEngine Error]:', e); }
}

// Reklam motorunu her 15 dakikada bir kontrol et
setInterval(runAdEngine, 15 * 60 * 1000);

// --- TEST AD ENGINE (INSTANT) ---
// Activity logs tablosunu dinleyerek "TEST_AD_REQUEST" loglarını yakalar ve anlık gönderir
async function listenForTestRequests() {
    supabase.channel('test_ads')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs', filter: 'action_key=eq.TEST_AD_REQUEST' }, async (payload) => {
            const { adId, adminTelegramId } = payload.new.metadata;
            console.log(`[TestEngine] Sending test ad ${adId} to admin ${adminTelegramId}`);
            
            const { data: ad } = await supabase.from('ads').select('*').eq('id', adId).single();
            if (!ad) return;

            try {
                const keyboard = ad.button_text ? Markup.inlineKeyboard([[Markup.button.url(ad.button_text, ad.button_link)]]) : null;
                const text = `🛠 <b>TEST GÖNDERİMİ</b>\n\n<b>${ad.title}</b>\n\n${ad.content}`;
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

// --- BOT COMMANDS & INTERFACE ---
const getMainMenu = () => Markup.inlineKeyboard([
    [Markup.button.webApp('🏪 Market Uygulamasını Aç', MINI_APP_URL)],
    [Markup.button.callback('👤 Profil & Kanallarım', 'menu_profile')],
    [Markup.button.callback('📚 Rehber', 'menu_guide'), Markup.button.callback('✨ Bot Vitrini', 'menu_market')],
    [Markup.button.callback('📝 Bildirim Yap', 'menu_report'), Markup.button.url('💬 Destek', 'https://t.me/BotlyHubSupport')]
]);

bot.start(async (ctx) => {
    const userId = ctx.from.id.toString();
    await supabase.from('users').upsert({ id: userId, name: ctx.from.first_name, username: ctx.from.username, status: 'Active' });
    return ctx.replyWithHTML(`🌟 <b>Merhaba ${ctx.from.first_name}, BotlyHub'a Hoş Geldin!</b>\n\nBotlarını yönet ve gelir elde etmeye başla.`, getMainMenu());
});

// Profil ve Kanal Yönetimi
bot.action('menu_profile', async (ctx) => {
    const userId = ctx.from.id.toString();
    const { count: botsCount } = await supabase.from('user_bots').select('*', { count: 'exact', head: true }).eq('user_id', userId);
    const { data: channels } = await supabase.from('channels').select('*').eq('user_id', userId);
    const totalRev = channels?.reduce((acc, curr) => acc + (curr.revenue || 0), 0) || 0;

    const profileText = `👤 <b>Profil Paneli</b>\n\n🆔 ID: <code>${userId}</code>\n🤖 Botların: <b>${botsCount || 0}</b>\n📢 Kanalların: <b>${channels?.length || 0}</b>\n💰 Toplam Kazanç: <b>₺${totalRev.toFixed(2)}</b>`;

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
        ctx.answerCbQuery(`Reklam Modu: ${newStatus ? 'AÇIK ✅' : 'KAPALI ❌'}`);
        return ctx.editMessageReplyMarkup(ctx.update.callback_query.message.reply_markup);
    }
});

bot.action('menu_back', (ctx) => ctx.editMessageText('🌟 <b>BotlyHub Ana Menü</b>', { parse_mode: 'HTML', ...getMainMenu() }));

bot.launch().then(() => console.log('>>> BotlyHub V3 Ad-Engine & Gateway Online!'));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
