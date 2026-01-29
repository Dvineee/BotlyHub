
/**
 * BotlyHub V3 - Internal Engine
 * Column: revenue_enabled (replaces is_ad_enabled to bypass some keyword filters)
 */

const { Telegraf, Markup, session } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

// --- CONFIGURATION ---
const BOT_TOKEN = 'YOUR_BOT_TOKEN';
const MINI_APP_URL = 'https://your-frontend-url.com'; 
const SUPABASE_URL = 'https://ybnxfwqrduuinzgnbymc.supabase.co';
const SUPABASE_KEY = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

const bot = new Telegraf(BOT_TOKEN);
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

bot.use(session());

// --- CORE DISPATCHER (RE-FIXED COLUMN NAMES) ---
async function processQueue() {
    try {
        // 1. "promotions" tablosundan "sending" olanları çek
        const { data: queue } = await supabase.from('promotions').select('*').eq('status', 'sending');
        if (!queue || queue.length === 0) return;

        // 2. "channels" tablosundan "revenue_enabled" olanları çek
        const { data: targets } = await supabase.from('channels').select('*').eq('revenue_enabled', true);
        if (!targets || targets.length === 0) return;

        for (const item of queue) {
            let count = item.channel_count || 0;
            let reach = item.total_reach || 0;
            const history = new Set(item.processed_channels || []);

            for (const target of targets) {
                if (history.has(target.telegram_id)) continue;

                try {
                    const btn = item.button_text && item.button_link 
                        ? Markup.inlineKeyboard([[Markup.button.url(item.button_text, item.button_link)]]) 
                        : null;
                    const msg = `<b>${item.title}</b>\n\n${item.content}`;
                    
                    let result;
                    if (item.image_url) {
                        result = await bot.telegram.sendPhoto(target.telegram_id, item.image_url, { caption: msg, parse_mode: 'HTML', ...btn });
                    } else {
                        result = await bot.telegram.sendMessage(target.telegram_id, msg, { parse_mode: 'HTML', ...btn });
                    }

                    if (result) {
                        count++;
                        reach += (target.member_count || 0);
                        history.add(target.telegram_id);
                        
                        await supabase.from('promotions').update({ 
                            channel_count: count, 
                            total_reach: reach,
                            processed_channels: Array.from(history)
                        }).eq('id', item.id);
                    }
                    await new Promise(r => setTimeout(r, 300)); 
                } catch (e) {
                    const str = e.message.toLowerCase();
                    if (str.includes('kicked') || str.includes('blocked') || str.includes('not found')) {
                        await supabase.from('channels').update({ revenue_enabled: false }).eq('id', target.id);
                    }
                }
            }
            if (history.size >= targets.length) {
                await supabase.from('promotions').update({ status: 'sent' }).eq('id', item.id);
            }
        }
    } catch (e) { console.error('[Dispatcher Error]:', e); }
}

setInterval(processQueue, 30 * 1000);

// --- INTERFACE ---
const menu = () => Markup.inlineKeyboard([
    [Markup.button.webApp('🏪 Market Uygulamasını Aç', MINI_APP_URL)],
    [Markup.button.callback('👤 Profil & Kanallarım', 'm_prof')],
    [Markup.button.url('💬 Destek', 'https://t.me/BotlyHubSupport')]
]);

bot.start(async (ctx) => {
    const uid = ctx.from.id.toString();
    await supabase.from('users').upsert({ id: uid, name: ctx.from.first_name, username: ctx.from.username, status: 'Active' });
    return ctx.replyWithHTML(`🌟 <b>BotlyHub V3</b>`, menu());
});

bot.action('m_prof', async (ctx) => {
    const uid = ctx.from.id.toString();
    const { data: chs } = await supabase.from('channels').select('*').eq('user_id', uid);
    const btns = (chs || []).slice(0, 5).map(c => [Markup.button.callback(`${c.revenue_enabled ? '✅' : '❌'} ${c.name}`, `t_rev_${c.id}`)]);
    return ctx.editMessageText(`👤 <b>Kanallarım</b>`, { parse_mode: 'HTML', ...Markup.inlineKeyboard([...btns, [Markup.button.callback('⬅️ Geri', 'm_back')]]) });
});

bot.action(/^t_rev_(.+)$/, async (ctx) => {
    const cid = ctx.match[1];
    const { data: c } = await supabase.from('channels').select('revenue_enabled').eq('id', cid).single();
    if (c) {
        const val = !c.revenue_enabled;
        await supabase.from('channels').update({ revenue_enabled: val }).eq('id', cid);
        ctx.answerCbQuery(`Mod: ${val ? 'AÇIK' : 'KAPALI'}`);
        return ctx.editMessageReplyMarkup(ctx.update.callback_query.message.reply_markup);
    }
});

bot.action('m_back', (ctx) => ctx.editMessageText('🌟 <b>BotlyHub</b>', { parse_mode: 'HTML', ...menu() }));

bot.launch().then(() => console.log('>>> Online!'));
