
/**
 * BotlyHub V3 - Reklam Paylaşım Motoru (Core Engine)
 */

const { Telegraf, Markup, session } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

const BOT_TOKEN = '8546984280:AAEg8rIho2IrqmjRl9t5BYAkFgkPAdL_130'; 
const MINI_APP_URL = 'https://botlyhub.vercel.app/#/'; 
const SUPABASE_URL = 'https://ybnxfwqrduuinzgnbymc.supabase.co';
const SUPABASE_SERVICE_KEY = 'sb_secret_jDxdXsQ-wb4RelA0hOfNkg_LTINMqJ5'; 

const bot = new Telegraf(BOT_TOKEN);
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

bot.use(session());

let isCurrentlyBroadcasting = false;

async function runAdSharingCycle() {
    if (isCurrentlyBroadcasting) return;

    isCurrentlyBroadcasting = true;
    console.log('\n--- [Reklam Paylaşım Döngüsü Başladı] ---');

    try {
        const { data: ads, error: adErr } = await supabase
            .from('promotions')
            .select('*')
            .eq('status', 'sending');

        if (adErr || !ads || ads.length === 0) {
            isCurrentlyBroadcasting = false;
            return;
        }

        const { data: channels } = await supabase
            .from('channels')
            .select('*')
            .eq('revenue_enabled', true);

        if (!channels || channels.length === 0) {
            isCurrentlyBroadcasting = false;
            return;
        }

        for (const ad of ads) {
            let processedList = new Set((ad.processed_channels || []).map(id => String(id)));

            for (const channel of channels) {
                const chatId = String(channel.telegram_id);
                if (processedList.has(chatId)) continue;

                try {
                    // Buton tıklama takibi için linki bot üzerinden yönlendirme yapabiliriz.
                    // Şimdilik direkt link gönderiyoruz, UI'daki tıklama manuel/analytics üzerinden gelecek.
                    const keyboard = ad.button_text && ad.button_link 
                        ? Markup.inlineKeyboard([[Markup.button.url(ad.button_text, ad.button_link)]]) 
                        : null;

                    const messageContent = `<b>${ad.title}</b>\n\n${ad.content}`;
                    
                    if (ad.image_url && ad.image_url.startsWith('http')) {
                        await bot.telegram.sendPhoto(channel.telegram_id, ad.image_url, { 
                            caption: messageContent, 
                            parse_mode: 'HTML', 
                            ...keyboard 
                        });
                    } else {
                        await bot.telegram.sendMessage(channel.telegram_id, messageContent, { 
                            parse_mode: 'HTML', 
                            ...keyboard 
                        });
                    }

                    processedList.add(chatId);
                    await supabase.from('promotions').update({ 
                        channel_count: processedList.size,
                        processed_channels: Array.from(processedList)
                    }).eq('id', ad.id);

                    await new Promise(r => setTimeout(r, 2000)); 
                } catch (e) {
                    console.error(`[Broadcaster]: ${channel.name} -> ${e.message}`);
                    if (e.message.includes('blocked') || e.message.includes('kicked')) {
                        await supabase.from('channels').update({ revenue_enabled: false }).eq('id', channel.id);
                    }
                }
            }

            // MÜKERRER PAYLAŞIM ENGELİ: Döngü bittiğinde PENDING'e çek
            await supabase.from('promotions').update({ 
                status: 'pending', 
                sent_at: new Date().toISOString()
            }).eq('id', ad.id);
        }
    } catch (err) {
        console.error('[Engine Error]:', err.message);
    } finally {
        isCurrentlyBroadcasting = false;
    }
}

setInterval(runAdSharingCycle, 30000);

bot.start((ctx) => ctx.replyWithHTML(`🚀 <b>BotlyHub Engine v3.2</b>`, Markup.inlineKeyboard([[Markup.button.webApp('Store', MINI_APP_URL)]])));

bot.launch();
