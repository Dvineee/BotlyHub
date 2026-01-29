
/**
 * BotlyHub V3 - Reklam Paylaşım Motoru (Core Engine)
 * Bu dosya reklamların kanallara dağıtımını ve durum yönetimini sağlar.
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

// Global Dağıtım Kilidi
let isCurrentlyBroadcasting = false;

/**
 * REKLAM PAYLAŞIM DÖNGÜSÜ
 */
async function runAdSharingCycle() {
    if (isCurrentlyBroadcasting) {
        console.log('[Atlandı]: Bir önceki reklam paylaşım döngüsü hala devam ediyor.');
        return;
    }

    isCurrentlyBroadcasting = true;
    console.log('\n--- [Reklam Paylaşım Döngüsü Başladı] ---');

    try {
        // 1. Sadece 'sending' durumundaki reklamları getir
        const { data: ads, error: adErr } = await supabase
            .from('promotions')
            .select('*')
            .eq('status', 'sending');

        if (adErr) throw adErr;
        
        if (!ads || ads.length === 0) {
            console.log('[Sistem]: Şu an paylaşım bekleyen aktif reklam yok.');
            isCurrentlyBroadcasting = false;
            return;
        }

        // 2. Paylaşım izni olan aktif kanalları getir
        const { data: channels, error: chErr } = await supabase
            .from('channels')
            .select('*')
            .eq('revenue_enabled', true);

        if (chErr) throw chErr;

        if (!channels || channels.length === 0) {
            console.log('[Sistem]: Paylaşım yapılacak aktif kanal bulunamadı.');
            isCurrentlyBroadcasting = false;
            return;
        }

        for (const ad of ads) {
            console.log(`[İşlem]: "${ad.title}" paylaşılıyor...`);
            
            // Mevcut gönderilen kanalların listesini al
            let processedList = new Set((ad.processed_channels || []).map(id => String(id)));
            let newlySentCount = 0;

            for (const channel of channels) {
                const chatId = String(channel.telegram_id);
                
                // Eğer bu kanala zaten gönderilmişse pas geç
                if (processedList.has(chatId)) continue;

                try {
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

                    // Başarılı gönderim sonrası listeyi ve DB'yi hemen güncelle
                    processedList.add(chatId);
                    newlySentCount++;
                    
                    await supabase.from('promotions').update({ 
                        channel_count: processedList.size,
                        processed_channels: Array.from(processedList)
                    }).eq('id', ad.id);

                    console.log(`   [BAŞARILI]: -> ${channel.name}`);
                    
                    // Flood koruması için bekleme
                    await new Promise(r => setTimeout(r, 2000)); 

                } catch (e) {
                    console.error(`   [HATA]: ${channel.name} mesaj iletilemedi: ${e.message}`);
                    // Eğer bot engellenmişse kanalı pasife çek
                    if (e.message.includes('blocked') || e.message.includes('kicked')) {
                        await supabase.from('channels').update({ revenue_enabled: false }).eq('id', channel.id);
                        // Bir daha denememesi için listeye ekle
                        processedList.add(chatId);
                        await supabase.from('promotions').update({ processed_channels: Array.from(processedList) }).eq('id', ad.id);
                    }
                }
            }

            // Döngü tamamlandığında reklam durumunu MUTLAKA 'pending' yap
            // Böylece bir sonraki 30 saniyelik kontrolde tekrar paylaşılmaz.
            await supabase.from('promotions').update({ 
                status: 'pending', 
                sent_at: new Date().toISOString()
            }).eq('id', ad.id);

            console.log(`[BİTTİ]: "${ad.title}" paylaşımı tamamlandı ve 'pending' moduna çekildi.`);
        }
    } catch (err) {
        console.error('[KRİTİK HATA]:', err.message);
    } finally {
        isCurrentlyBroadcasting = false;
        console.log('--- [Reklam Paylaşım Döngüsü Tamamlandı] ---\n');
    }
}

// Her 30 saniyede bir kontrol et
setInterval(runAdSharingCycle, 30000);

// Bot Başlatma
bot.start(async (ctx) => {
    return ctx.replyWithHTML(`🚀 <b>BotlyHub Reklam Paylaşım Motoru v3.2</b>\n\nSistem reklam kuyruğunu anlık olarak takip ediyor.`, Markup.inlineKeyboard([
        [Markup.button.webApp('🚀 Store Uygulamasını Aç', MINI_APP_URL)]
    ]));
});

bot.launch().then(() => console.log('✅ Reklam Motoru Yayında (Mükerrer Paylaşım Engellendi)'));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
