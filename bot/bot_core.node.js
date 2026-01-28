
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

// Global Kilit: Aynı anda iki döngünün çalışmasını engeller
let isProcessingBroadcast = false;

/**
 * REKLAM DAĞITIM MOTORU (Broadcast Engine)
 */
async function processBroadcastQueue() {
    if (isProcessingBroadcast) {
        console.log('[Skip]: Önceki döngü henüz bitmedi, atlanıyor...');
        return;
    }

    isProcessingBroadcast = true;
    console.log('\n--- [Broadcast Cycle Başladı] ---');

    try {
        // 1. Sadece 'sending' durumundaki reklamları çek
        const { data: queue, error: qErr } = await supabase
            .from('promotions')
            .select('*')
            .eq('status', 'sending');

        if (qErr) throw qErr;
        
        if (!queue || queue.length === 0) {
            console.log('[Broadcast]: Aktif dağıtımda (sending) reklam yok.');
            isProcessingBroadcast = false;
            return;
        }

        // 2. Aktif yayın izni olan kanalları çek
        const { data: channels, error: cErr } = await supabase
            .from('channels')
            .select('*')
            .eq('revenue_enabled', true);

        if (cErr) throw cErr;

        if (!channels || channels.length === 0) {
            console.log('[Broadcast]: Yayın yapılacak aktif kanal bulunamadı.');
            isProcessingBroadcast = false;
            return;
        }

        for (const promo of queue) {
            console.log(`[İşleniyor]: "${promo.title}"`);
            
            // Geçmişi yükle
            let history = new Set((promo.processed_channels || []).map(id => String(id)));
            
            for (const channel of channels) {
                const channelIdStr = String(channel.telegram_id);
                
                // Eğer bu kanala zaten gönderilmişse atla
                if (history.has(channelIdStr)) continue;

                try {
                    const keyboard = promo.button_text && promo.button_link 
                        ? Markup.inlineKeyboard([[Markup.button.url(promo.button_text, promo.button_link)]]) 
                        : null;

                    const message = `<b>${promo.title}</b>\n\n${promo.content}`;
                    
                    if (promo.image_url && promo.image_url.startsWith('http')) {
                        await bot.telegram.sendPhoto(channel.telegram_id, promo.image_url, { 
                            caption: message, 
                            parse_mode: 'HTML', 
                            ...keyboard 
                        });
                    } else {
                        await bot.telegram.sendMessage(channel.telegram_id, message, { 
                            parse_mode: 'HTML', 
                            ...keyboard 
                        });
                    }

                    // Gönderim başarılı, geçmişe ekle ve DB'ye HEMEN yaz (Anlık Senkronizasyon)
                    history.add(channelIdStr);
                    console.log(`   [OK]: -> ${channel.name}`);
                    
                    await supabase.from('promotions').update({ 
                        channel_count: history.size,
                        processed_channels: Array.from(history)
                    }).eq('id', promo.id);

                    // Flood önleme
                    await new Promise(r => setTimeout(r, 1500)); 

                } catch (e) {
                    console.error(`   [HATA]: ${channel.name} -> ${e.message}`);
                    if (e.message.includes('blocked') || e.message.includes('kicked') || e.message.includes('chat not found')) {
                        await supabase.from('channels').update({ revenue_enabled: false }).eq('id', channel.id);
                        // Hata olsa bile history'ye ekle ki tekrar denemesin
                        history.add(channelIdStr);
                        await supabase.from('promotions').update({ processed_channels: Array.from(history) }).eq('id', promo.id);
                    }
                }
            }

            // Döngü sonunda tüm kanallar taranmış olur (başarılı veya hatalı)
            // Reklamı mutlaka 'pending'e çek ki tekrar tetiklenmesin
            await supabase.from('promotions').update({ 
                status: 'pending', 
                sent_at: new Date().toISOString()
            }).eq('id', promo.id);

            console.log(`[BİTTİ]: "${promo.title}" yayını durduruldu (pending).`);
        }
    } catch (err) {
        console.error('[Kritik Hata]:', err.message);
    } finally {
        isProcessingBroadcast = false;
        console.log('--- [Broadcast Cycle Tamamlandı] ---\n');
    }
}

// Kontrol periyodu (Her 30 saniyede bir tıkla)
setInterval(processBroadcastQueue, 30000);

// Temel Bot Komutları
bot.start(async (ctx) => {
    const user = ctx.from;
    await supabase.from('users').upsert({ 
        id: String(user.id), 
        name: user.first_name, 
        username: user.username, 
        status: 'Active', 
        joindate: new Date().toISOString() 
    });
    return ctx.replyWithHTML(`🚀 <b>BotlyHub Engine v3.1</b>\n\nSistem online ve reklam motoru kilitli/güvenli modda çalışıyor.`, Markup.inlineKeyboard([
        [Markup.button.webApp('🚀 Store', MINI_APP_URL)],
        [Markup.button.callback('📊 Kanallarım', 'view_channels')]
    ]));
});

bot.action('view_channels', async (ctx) => {
    const { data: channels } = await supabase.from('channels').select('*').eq('user_id', String(ctx.from.id));
    if (!channels || channels.length === 0) return ctx.answerCbQuery('Kanalınız bulunamadı.', { show_alert: true });
    
    let text = `📢 <b>Bağlı Kanallarınız:</b>\n\n`;
    channels.forEach(c => text += `${c.revenue_enabled ? '🟢' : '🔴'} ${c.name} (${c.member_count} Üye)\n`);
    
    return ctx.editMessageText(text, { 
        parse_mode: 'HTML', 
        ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Geri', 'back')]]) 
    });
});

bot.action('back', (ctx) => ctx.editMessageText('🚀 <b>BotlyHub Engine</b>', { parse_mode: 'HTML' }));

bot.launch().then(() => console.log('✅ BotlyHub Engine Yayında (Safety Lock Enabled)'));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
