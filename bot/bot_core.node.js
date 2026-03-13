
const { Telegraf, Markup, session } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

// --- CONFIG ---
const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';
const MINI_APP_URL = 'https://botlyhub-v3.vercel.app'; // Kendi URL'nizle değiştirin
const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co';
const SUPABASE_KEY = 'sb_secret_F0j5s-9UJAWdQwA75PMzQw_IuACUZbV';

const bot = new Telegraf(BOT_TOKEN);
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

bot.use(session());

/**
 * 1. REKLAM DAĞITIM MOTORU (AD DISPATCHER)
 * Bu fonksiyon veritabanındaki reklam kuyruğunu tarar ve kanallara gönderir.
 */
async function adDispatcher() {
    try {
        // Yayında olan (sending) reklamları al
        const { data: promotions } = await supabase
            .from('promotions')
            .select('*')
            .eq('status', 'sending');

        if (!promotions || promotions.length === 0) return;

        // Reklam kabul eden (revenue_enabled) ve arşivlenmemiş kanalları al
        const { data: channelsData } = await supabase
            .from('channels')
            .select('*')
            .eq('revenue_enabled', true);

        if (!channelsData || channelsData.length === 0) return;

        const channels = channelsData.filter(c => !c.archived);

        for (const promo of promotions) {
            let sourceMsgId = promo.source_message_id;
            const processed = new Set(promo.processed_channels || []);
            let currentReach = Number(promo.total_reach || 0);

            // 1. ADIM: ANA KANALA PAYLAŞIM (ZORUNLU)
            if (promo.source_channel && !sourceMsgId) {
                try {
                    console.log(`[BOT] Ana kanala paylaşım yapılıyor: ${promo.source_channel}`);
                    const keyboard = [];
                    if (promo.button_text && promo.button_link) {
                        keyboard.push([Markup.button.url(promo.button_text, promo.button_link)]);
                    }
                    const caption = `<b>${promo.title}</b>\n\n${promo.content}`;
                    
                    let sent;
                    if (promo.image_url) {
                        sent = await bot.telegram.sendPhoto(promo.source_channel, promo.image_url, {
                            caption,
                            parse_mode: 'HTML',
                            ...Markup.inlineKeyboard(keyboard)
                        });
                    } else {
                        sent = await bot.telegram.sendMessage(promo.source_channel, caption, {
                            parse_mode: 'HTML',
                            ...Markup.inlineKeyboard(keyboard)
                        });
                    }

                    if (sent) {
                        sourceMsgId = sent.message_id;
                        await supabase.from('promotions').update({
                            source_message_id: sourceMsgId
                        }).eq('id', promo.id);
                        console.log(`[BOT] Ana kanal paylaşımı başarılı. Mesaj ID: ${sourceMsgId}`);
                    }
                } catch (err) {
                    console.error(`[BOT] KRİTİK HATA: Ana kanal paylaşımı başarısız (${promo.source_channel}):`, err.message);
                    continue; // Ana kanala paylaşılamazsa diğerlerine iletilemez, bu reklamı atla
                }
            }

            if (!sourceMsgId || !promo.source_channel) {
                console.log(`[BOT] Reklam atlanıyor: Ana kanal veya Mesaj ID eksik (${promo.title})`);
                continue;
            }

            // 2. ADIM: DİĞER KANALLARA İLETME (ZORUNLU)
            for (const channel of channels) {
                if (processed.has(channel.telegram_id)) continue;
                if (channel.telegram_id === promo.source_channel || channel.name === promo.source_channel) continue;

                try {
                    // Sadece İLETME (Forward) yapıyoruz, eski direkt gönderim sistemi kaldırıldı.
                    console.log(`[BOT] İletiliyor: ${promo.source_channel} (Msg: ${sourceMsgId}) -> ${channel.name} (${channel.telegram_id})`);
                    const sentMsg = await bot.telegram.forwardMessage(channel.telegram_id, promo.source_channel, sourceMsgId);
                    
                    if (sentMsg) {
                        console.log(`[BOT] ✅ Başarıyla iletildi: ${channel.name}`);
                        processed.add(channel.telegram_id);
                        currentReach += Number(channel.member_count || 0);

                        await supabase.from('promotions').update({
                            processed_channels: Array.from(processed),
                            total_reach: currentReach,
                            channel_count: processed.size
                        }).eq('id', promo.id);
                    }

                    await new Promise(r => setTimeout(r, 500)); 
                } catch (err) {
                    console.error(`Kanal İletim Hatası (${channel.name}):`, err.message);
                    if (err.message.includes('kicked') || err.message.includes('chat not found')) {
                        await supabase.from('channels').update({ revenue_enabled: false }).eq('id', channel.id);
                    }
                }
            }

            if (channels.length > 0 && processed.size >= (promo.source_channel ? channels.length - 1 : channels.length)) {
                await supabase.from('promotions').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', promo.id);
                console.log(`🏁 Reklam tamamlandı: ${promo.title}`);
            }
        }
    } catch (e) {
        console.error('Dispatcher Hatası:', e);
    }
}

// Reklam motorunu her 30 saniyede bir çalıştır
setInterval(adDispatcher, 30000);

/**
 * 2. KANAL KEŞİF MANTIĞI (DISCOVERY)
 * Bot bir kanala eklendiğinde/çıkarıldığında tetiklenir.
 */
bot.on('my_chat_member', async (ctx) => {
    const chat = ctx.myChatMember.chat;
    const status = ctx.myChatMember.new_chat_member.status;
    const ownerId = ctx.myChatMember.from.id.toString();

    if (status === 'administrator' || status === 'member') {
        // Bot eklendi: Keşif kaydı oluştur
        const memberCount = await ctx.telegram.getChatMembersCount(chat.id).catch(() => 0);
        
        await supabase.from('bot_discovery_logs').insert({
            owner_id: ownerId,
            chat_id: chat.id.toString(),
            channel_name: chat.title || 'İsimsiz Kanal',
            member_count: memberCount,
            is_synced: false
        });
        
        console.log(`Yeni Kanal Keşfedildi: ${chat.title}`);
    }
});

/**
 * 3. AUTH & DEEP LINKING (DOĞRULAMA)
 */
bot.start(async (ctx) => {
    const payload = ctx.startPayload; // Örn: /start verify_123
    const uid = ctx.from.id.toString();

    // Kullanıcıyı veritabanına kaydet veya güncelle
    await supabase.from('users').upsert({
        id: uid,
        name: ctx.from.first_name,
        username: ctx.from.username,
        status: 'Active',
        joindate: new Date().toISOString()
    });

    let welcomeMsg = `🌟 <b>BotlyHub V3: Profesyonel Bot Pazaryeri</b>\n\nHoş geldin ${ctx.from.first_name}! Aşağıdaki butona tıklayarak mağazayı açabilir, botlarını yönetebilir ve kazancını takip edebilirsin.`;

    if (payload && payload.startsWith('verify_')) {
        welcomeMsg = `✅ <b>Hesap Doğrulandı!</b>\n\nWeb uygulamasına geri dönerek işlemlerine devam edebilirsin.`;
        // Burada özel doğrulama mantığı çalıştırılabilir
    }

    return ctx.replyWithHTML(welcomeMsg, Markup.inlineKeyboard([
        [Markup.button.webApp('🏪 Mağazayı Aç', MINI_APP_URL)],
        [Markup.button.url('📣 Kanalımız', 'https://t.me/BotlyHub')],
        [Markup.button.callback('🛠 Destek', 'support_info')]
    ]));
});

bot.action('support_info', (ctx) => {
    return ctx.answerCbQuery('Destek ekibimize @BotlyHubSupport üzerinden ulaşabilirsiniz.', { show_alert: true });
});

bot.launch().then(() => console.log('🚀 BotlyHub Core Online!'));

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
