
/**
 * BotlyHub V3 - Ana Dağıtım ve Yönetim Motoru
 * Node.js & Telegraf & Supabase
 */

const { Telegraf, Markup, session } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

// --- YAPILANDIRMA ---
// NOT: Bu değerleri gerçek kullanımda .env dosyasından çekmelisiniz.
const BOT_TOKEN = 'YOUR_BOT_TOKEN_BURAYA'; 
const MINI_APP_URL = 'https://botlyhub-v3.vercel.app'; // Mini App yayındaki URL'iniz
const SUPABASE_URL = 'https://ybnxfwqrduuinzgnbymc.supabase.co';
const SUPABASE_SERVICE_KEY = 'YOUR_SUPABASE_SERVICE_ROLE_KEY'; // Admin yetkisi için Service Role Key

const bot = new Telegraf(BOT_TOKEN);
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

bot.use(session());

/**
 * REKLAM DAĞITIM MOTORU (Broadcast Engine)
 * Her 30 saniyede bir veritabanındaki kuyruğu kontrol eder.
 */
async function processBroadcastQueue() {
    console.log('[Broadcast]: Kuyruk taranıyor...');
    try {
        // 1. Durumu 'sending' olan reklamları çek
        const { data: queue, error: qErr } = await supabase
            .from('promotions')
            .select('*')
            .eq('status', 'sending');

        if (qErr || !queue || queue.length === 0) return;

        // 2. Yayın izni olan kanalları çek
        const { data: channels, error: cErr } = await supabase
            .from('channels')
            .select('*')
            .eq('revenue_enabled', true);

        if (cErr || !channels || channels.length === 0) {
            console.log('[Broadcast]: Yayın yapılacak kanal bulunamadı.');
            return;
        }

        for (const promo of queue) {
            console.log(`[Broadcast]: '${promo.title}' işleniyor...`);
            
            // Daha önce gönderilen kanalları kontrol et (Duplicate önleyici)
            const processedList = promo.processed_channels || [];
            const history = new Set(processedList);
            let successCount = promo.channel_count || 0;
            let totalReach = promo.total_reach || 0;

            for (const channel of channels) {
                if (history.has(channel.telegram_id)) continue;

                try {
                    const keyboard = promo.button_text && promo.button_link 
                        ? Markup.inlineKeyboard([[Markup.button.url(promo.button_text, promo.button_link)]]) 
                        : null;

                    const message = `<b>${promo.title}</b>\n\n${promo.content}`;
                    
                    let sent;
                    if (promo.image_url && promo.image_url.startsWith('http')) {
                        sent = await bot.telegram.sendPhoto(channel.telegram_id, promo.image_url, {
                            caption: message,
                            parse_mode: 'HTML',
                            ...keyboard
                        });
                    } else {
                        sent = await bot.telegram.sendMessage(channel.telegram_id, message, {
                            parse_mode: 'HTML',
                            ...keyboard
                        });
                    }

                    if (sent) {
                        successCount++;
                        totalReach += (channel.member_count || 0);
                        history.add(channel.telegram_id);
                        
                        // Veritabanını anlık güncelle
                        await supabase.from('promotions').update({ 
                            channel_count: successCount, 
                            total_reach: totalReach,
                            processed_channels: Array.from(history)
                        }).eq('id', promo.id);
                        
                        console.log(`[OK]: ${channel.name} kanalına iletildi.`);
                    }

                    // Flood limitlerine takılmamak için kısa bekleme
                    await new Promise(r => setTimeout(r, 500)); 

                } catch (e) {
                    const errorMsg = e.message.toLowerCase();
                    console.error(`[FAIL]: ${channel.name} -> ${e.message}`);
                    
                    // Bot yetkisi yoksa veya kanal bulunamıyorsa kanalı otomatik pasife al
                    if (errorMsg.includes('kicked') || errorMsg.includes('blocked') || errorMsg.includes('chat not found')) {
                        await supabase.from('channels').update({ revenue_enabled: false }).eq('id', channel.id);
                    }
                }
            }

            // Dağıtım bittiyse durumu 'sent' yap
            if (history.size >= channels.length) {
                await supabase.from('promotions').update({ 
                    status: 'sent', 
                    sent_at: new Date().toISOString() 
                }).eq('id', promo.id);
                console.log(`[FINISH]: '${promo.title}' dağıtımı tamamlandı.`);
            }
        }
    } catch (err) {
        console.error('[CRITICAL]:', err);
    }
}

// 30 saniyede bir çalıştır
setInterval(processBroadcastQueue, 30000);

// --- KOMUTLAR VE ETKİLEŞİM ---

const getMenu = () => Markup.inlineKeyboard([
    [Markup.button.webApp('🚀 BotlyHub Store', MINI_APP_URL)],
    [Markup.button.callback('📊 Kanallarım', 'view_channels'), Markup.button.callback('💰 Kazancım', 'view_earnings')],
    [Markup.button.url('🛠 Destek', 'https://t.me/BotlyHubSupport')]
]);

bot.start(async (ctx) => {
    const user = ctx.from;
    
    // Kullanıcıyı senkronize et
    await supabase.from('users').upsert({ 
        id: user.id.toString(), 
        name: `${user.first_name} ${user.last_name || ''}`.trim(), 
        username: user.username,
        status: 'Active',
        joindate: new Date().toISOString(),
        role: 'User'
    }, { onConflict: 'id' });

    return ctx.replyWithHTML(
        `👋 <b>Selam ${user.first_name}!</b>\n\n` +
        `BotlyHub V3 platformuna hoş geldin. Buradan botları keşfedebilir, kanallarını yönetebilir ve reklam yayınlayarak TON kazanabilirsin.\n\n` +
        `👇 Başlamak için aşağıdaki butona tıkla:`,
        getMenu()
    );
});

bot.action('view_channels', async (ctx) => {
    const { data: channels } = await supabase.from('channels').select('*').eq('user_id', ctx.from.id.toString());
    
    if (!channels || channels.length === 0) {
        return ctx.answerCbQuery('Henüz sisteme bağlı bir kanalınız yok. Mini App üzerinden bot ekleyerek kanal bağlayabilirsiniz.', { show_alert: true });
    }

    let text = `<b>📢 Bağlı Kanalların:</b>\n\n`;
    channels.forEach(c => {
        text += `${c.revenue_enabled ? '🟢' : '🔴'} <b>${c.name}</b> (${c.member_count} üye)\n`;
    });

    return ctx.editMessageText(text, {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Geri', 'back_to_menu')]])
    });
});

bot.action('view_earnings', async (ctx) => {
    return ctx.answerCbQuery('Kazanç detaylarınızı Mini App üzerinden "Varlıklarım" sekmesinden görebilirsiniz.', { show_alert: true });
});

bot.action('back_to_menu', (ctx) => {
    return ctx.editMessageText(`🚀 <b>BotlyHub Ana Menü</b>`, { parse_mode: 'HTML', ...getMenu() });
});

// Botu başlat
bot.launch().then(() => {
    console.log('✅ BotlyHub V3 Engine is running...');
});

// Güvenli kapatma
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
