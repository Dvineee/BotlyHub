
/**
 * BotlyHub V3 - Ana Dağıtım ve Yönetim Motoru
 * Node.js & Telegraf & Supabase
 */

const { Telegraf, Markup, session } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

// --- YAPILANDIRMA ---
const BOT_TOKEN = '8546984280:AAEg8rIho2IrqmjRl9t5BYAkFgkPAdL_130'; 
const MINI_APP_URL = 'https://botlyhub.vercel.app/#/'; 
const SUPABASE_URL = 'https://ybnxfwqrduuinzgnbymc.supabase.co';
const SUPABASE_SERVICE_KEY = 'sb_secret_jDxdXsQ-wb4RelA0hOfNkg_LTINMqJ5'; 

const bot = new Telegraf(BOT_TOKEN);
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

bot.use(session());

/**
 * REKLAM DAĞITIM MOTORU (Broadcast Engine)
 * Derin Analiz Modu eklendi.
 */
async function processBroadcastQueue() {
    console.log('\n--- [Broadcast Kontrolü] ---');
    try {
        // 1. Tüm reklamları analiz et (Hata ayıklama için)
        const { data: allPromos } = await supabase.from('promotions').select('status');
        if (allPromos) {
            const stats = allPromos.reduce((acc, p) => {
                acc[p.status] = (acc[p.status] || 0) + 1;
                return acc;
            }, {});
            console.log(`[Debug]: DB Özeti -> Toplam: ${allPromos.length}, Detay:`, stats);
        }

        // 2. Sadece 'sending' durumundaki reklamları çek
        const { data: queue, error: qErr } = await supabase
            .from('promotions')
            .select('*')
            .eq('status', 'sending');

        if (qErr) {
            console.error('[Hata]: Veritabanı bağlantı hatası:', qErr.message);
            return;
        }
        
        if (!queue || queue.length === 0) {
            console.log('[Broadcast]: Şu an aktif dağıtımda (status="sending") olan reklam bulunamadı.');
            console.log('[İpucu]: Reklam paylaşmak için Admin Panelinden bir reklama "BAŞLAT" demelisiniz.');
            return;
        }

        // 3. Aktif kanalları çek
        const { data: channels, error: cErr } = await supabase
            .from('channels')
            .select('*')
            .eq('revenue_enabled', true);

        if (cErr) {
            console.error('[Hata]: Kanallar çekilemedi:', cErr.message);
            return;
        }

        if (!channels || channels.length === 0) {
            console.log('[Broadcast]: Dağıtım bekleyen reklam var fakat yayın izni olan kanal bulunamadı.');
            return;
        }

        for (const promo of queue) {
            const history = new Set((promo.processed_channels || []).map(id => String(id)));
            let successInLoop = 0;
            
            for (const channel of channels) {
                const channelIdStr = String(channel.telegram_id);
                if (history.has(channelIdStr)) continue;

                try {
                    const keyboard = promo.button_text && promo.button_link 
                        ? Markup.inlineKeyboard([[Markup.button.url(promo.button_text, promo.button_link)]]) 
                        : null;

                    const message = `<b>${promo.title}</b>\n\n${promo.content}`;
                    
                    if (promo.image_url && promo.image_url.startsWith('http')) {
                        await bot.telegram.sendPhoto(channel.telegram_id, promo.image_url, { caption: message, parse_mode: 'HTML', ...keyboard });
                    } else {
                        await bot.telegram.sendMessage(channel.telegram_id, message, { parse_mode: 'HTML', ...keyboard });
                    }

                    history.add(channelIdStr);
                    successInLoop++;
                    console.log(`[OK]: ${promo.title} -> ${channel.name}`);
                    await new Promise(r => setTimeout(r, 800)); 

                } catch (e) {
                    console.error(`[Fail]: ${channel.name} -> ${e.message}`);
                    if (e.message.includes('blocked') || e.message.includes('kicked')) {
                        await supabase.from('channels').update({ revenue_enabled: false }).eq('id', channel.id);
                    }
                }
            }

            // DB Güncelleme
            const isFinished = history.size >= channels.length;
            await supabase.from('promotions').update({ 
                channel_count: history.size,
                processed_channels: Array.from(history),
                status: isFinished ? 'sent' : 'sending',
                sent_at: isFinished ? new Date().toISOString() : null
            }).eq('id', promo.id);
        }
    } catch (err) {
        console.error('[Kritik Hata]:', err);
    }
}

setInterval(processBroadcastQueue, 30000);

// Temel Komutlar (Aynı Kalacak)
bot.start(async (ctx) => {
    const user = ctx.from;
    await supabase.from('users').upsert({ id: String(user.id), name: user.first_name, username: user.username, status: 'Active', joindate: new Date().toISOString() });
    return ctx.replyWithHTML(`🚀 <b>BotlyHub Engine</b>\n\nSistem online!`, Markup.inlineKeyboard([
        [Markup.button.webApp('🚀 Store', MINI_APP_URL)],
        [Markup.button.callback('📊 Kanallarım', 'view_channels')]
    ]));
});

bot.action('view_channels', async (ctx) => {
    const { data: channels } = await supabase.from('channels').select('*').eq('user_id', String(ctx.from.id));
    if (!channels || channels.length === 0) return ctx.answerCbQuery('Kanalınız yok.', { show_alert: true });
    let text = `📢 <b>Kanallar:</b>\n\n`;
    channels.forEach(c => text += `${c.revenue_enabled ? '🟢' : '🔴'} ${c.name}\n`);
    return ctx.editMessageText(text, { parse_mode: 'HTML', ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Geri', 'back')]]) });
});

bot.action('back', (ctx) => ctx.editMessageText('🚀 <b>Ana Menü</b>', { parse_mode: 'HTML' }));

bot.launch().then(() => console.log('✅ BotlyHub Engine Listening...'));
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
