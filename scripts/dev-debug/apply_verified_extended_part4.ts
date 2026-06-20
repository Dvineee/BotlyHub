import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import { realBotsData } from './bots_data';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface ExtendedApp {
  id: string; 
  slug: string;
  name: string;
  desc: string;
  category: string[];
  website_url: string | null;
  app_url: string | null;
  telegram_group: string | null;
  languages: string[];
  x_url: string | null;
  github_url: string | null;
  youtube_url: string | null;
  android_url: string | null;
  ios_url: string | null;
}

const csvApps: ExtendedApp[] = [
  {
    id: "BOT-REAL-3001",
    slug: "tada-mini",
    name: "TADA mini",
    desc: "TADA mini, Güneydoğu Asya'nın popüler araç çağırma platformu TADA tarafından TON Foundation ortaklığıyla geliştirilen ve doğrudan Telegram üzerinden çalışan devrim niteliğinde bir Web3 Mini App uygulamasıdır. Kullanıcılar, ek bir uygulama indirmeden veya kayıt olmadan doğrudan Telegram mesajlaşma arayüzü üzerinden taksi veya araç rezervasyonu yapabilir ve ödemelerini Toncoin (TON) veya USDT (TON) ile saniyeler içinde tamamlayabilirler. Singapur, Tayland, Vietnam ve Kamboçya gibi ülkelerde 300 binden fazla sürücüyü bünyesinde barındıran TADA, sıfır komisyon politikasıyla hem sürücüler hem de yolcular için en adil fiyatları sunar. Günlük görevler ve davet sistemleriyle kripto ödülleri de kazandıran bu yenilikçi proje, Web2 geleneksel hizmetlerinin Web3 dünyasına kitlesel entegrasyonunun en başarılı ve somut örneklerinden biridir.",
    category: ["apps", "utilities"],
    website_url: "https://tada.global",
    app_url: "https://t.me/TADA_Ride_Bot",
    telegram_group: null,
    languages: ["English", "Chinese", "Vietnamese", "Cambodian"],
    x_url: null,
    github_url: null,
    youtube_url: null,
    android_url: "https://play.google.com/store/apps/details?id=com.mvlchain.tada",
    ios_url: "https://apps.apple.com/app/tada-ride-hailing/id1438853874"
  },
  {
    id: "BOT-REAL-3002",
    slug: "tonmobile-esim",
    name: "TonMobile eSIM",
    desc: "TonMobile eSIM, seyahat edenlerin fahiş dolaşım (roaming) ücretlerinden kurtulmasını sağlayan ve doğrudan TON ekosistemiyle entegre çalışan yeni nesil bir dijital SIM kart (eSIM) sağlayıcısıdır. Kullanıcılar, fiziksel bir SIM karta ihtiyaç duymadan, dünya genelinde 180'den fazla ülkede geçerli olan uygun fiyatlı mobil internet paketlerini saniyeler içinde satın alıp aktif hale getirebilirler. Platformun en büyük avantajlarından biri, ödemelerin kredi kartlarının yanı sıra Toncoin (TON) veya diğer popüler kripto para birimleriyle de yapılabilmesidir. Hem bağımsız mobil uygulamaları hem de pratik Telegram botu üzerinden çalışan bu yenilikçi seyahat aracı, fiziksel evrak işlerini ortadan kaldırarak küresel internet erişimini son derece hızlı, güvenli, ekonomik ve Web3 dostu bir deneyime dönüştürür.",
    category: ["apps", "utilities"],
    website_url: "https://tonmobile.travel",
    app_url: null,
    telegram_group: "https://t.me/tonmobile_esim",
    languages: ["English", "Russian"],
    x_url: null,
    github_url: null,
    youtube_url: null,
    android_url: "https://play.google.com/store/apps/details?id=com.tonmobile.travel",
    ios_url: "https://apps.apple.com/app/tonmobile-esim-travel-data/id1614742661"
  },
  {
    id: "BOT-REAL-3003",
    slug: "tonnel-network",
    name: "Tonnel Network",
    desc: "Tonnel Network, TON (The Open Network) blockchain ağı üzerinde geliştirilmiş ilk ve en popüler sıfır bilgi kanıtı (Zero-Knowledge) tabanlı gizlilik protokolüdür. Ethereum ağındaki Tornado Cash protokolüne benzer bir coin karıştırma (coin mixing) mantığıyla çalışan Tonnel, kullanıcıların işlem geçmişlerini ve cüzdan bakiyelerini tamamen anonim hale getirmelerine olanak tanır. Kullanıcılar, TON, Jetton tokenları veya NFT'lerini ortak bir akıllı sözleşme havuzuna yatırıp, daha sonra bu fonları tamamen farklı ve izi sürülemez yeni adreslere güvenle çekebilirler. Açık kaynak kodlu yapısı ve merkeziyetsiz yönetim modeliyle öne çıkan Tonnel Network, TON blockchain ağının şeffaf yapısı içinde kişisel finansal gizliliğini korumak isteyen Web3 kullanıcıları için vazgeçilmez ve son derece güvenli bir altyapı aracıdır.",
    category: ["apps", "utilities", "security_privacy"],
    website_url: "https://tonnel.network",
    app_url: "https://t.me/tonnel_network_bot",
    telegram_group: "https://t.me/tonnel_network",
    languages: ["English", "Russian"],
    x_url: "https://x.com/tonnel_network",
    github_url: "https://github.com/tonnel-network",
    youtube_url: null,
    android_url: null,
    ios_url: null
  },
  {
    id: "BOT-REAL-2108",
    slug: "avacoin",
    name: "AVACOIN",
    desc: "AVACOIN, Telegram üzerinde çalışan ve sanal altın madenciliği temasıyla milyonlarca oyuncuyu bir araya getiren son derece popüler bir oyna-kazan (play-to-earn) Web3 Mini App oyunudur. Oyuncular, ilk başlarda basit bir tıklama (clicker) oyunu olarak başlayan bu platformda ekrana dokunarak sanal altın tozları biriktirir ve bunları oyun içi AVACN tokenlarına dönüştürürler. Zamanla gelişen oyun mekanikleri sayesinde platform; emlak yatırımları, staking havuzları, lonca (guild) savaşları ve pasif gelir getiren sanal altın fabrikaları gibi zengin stratejik ögeler barındıran kapsamlı bir GameFi ekosistemine dönüşmüştür. Kullanıcı dostu arayüzü, günlük görevleri ve adil dağıtım modeliyle AVACOIN, TON blockchain ağının en uzun soluklu ve topluluk bağlılığı en yüksek oyun projelerinden biridir.",
    category: ["apps", "games", "crypto"],
    website_url: "https://avacoin.io",
    app_url: "https://t.me/avagoldcoin_bot",
    telegram_group: "https://t.me/avagoldcoin",
    languages: ["English", "Russian"],
    x_url: "https://x.com/avagoldcoin",
    github_url: null,
    youtube_url: null,
    android_url: null,
    ios_url: null
  },
  {
    id: "BOT-REAL-3004",
    slug: "tonstarter",
    name: "Tonstarter",
    desc: "Tonstarter, TON (The Open Network) blockchain ağı üzerinde geliştirilen ilk, en büyük ve en güvenilir merkeziyetsiz proje fonlama ve ön satış (launchpad) platformudur. Platform, Web3 girişimcilerinin ve yeni projelerin erken aşamada topluluktan fon toplamasına olanak tanırırken, yatırımcılara da gelecek vadeden projelere güvenli ve adil bir şekilde erken yatırım yapma fırsatı sunar. Akıllı sözleşmelerle güvence altına alınan adil dağıtım (fair launch) modelleri ve sıkı güvenlik denetimlerinden geçen projeleri listelemesiyle tanınan Tonstarter, TON ekosisteminin büyümesinde kritik bir katalizör görevi üstlenmektedir. Kullanıcı dostu arayüzü sayesinde cüzdanlarını bağlayan yatırımcılar, Toncoin (TON) kullanarak ön satışlara ve airdrop kampanyalarına kolayca katılabilir, ekosistemin en yeni fırsatlarını güvenle keşfedebilirler.",
    category: ["apps", "finance", "crypto"],
    website_url: "https://tonstarter.com",
    app_url: null,
    telegram_group: "https://t.me/tonstarter",
    languages: ["English", "Russian"],
    x_url: "https://x.com/tonstarter",
    github_url: "https://github.com/tonstarter",
    youtube_url: null,
    android_url: null,
    ios_url: null
  },
  {
    id: "BOT-REAL-3005",
    slug: "openmask",
    name: "OpenMask",
    desc: "OpenMask, tarayıcı uzantısı (extension) olarak çalışan ve TON blockchain ekosistemi için özel olarak geliştirilmiş, Ethereum dünyasındaki MetaMask tarzında son derece popüler bir gözetimsiz (non-custodial) kripto para cüzdanıdır. Kullanıcıların kendi özel anahtarları (private key) ve kurtarma kelimeleri üzerinde tam kontrol sahibi olmasını sağlayan cüzdan; Toncoin, Jetton tokenları ve NFT'lerin güvenle saklanması, gönderilmesi ve alınması için mükemmel bir altyapı sunar. TON Connect teknolojisini desteklemesi sayesinde merkeziyetsiz borsalar (DEX), NFT pazar yerleri ve Web3 oyunları gibi dApp'lere saniyeler içinde sorunsuz bir şekilde bağlanabilir. Güçlü güvenlik şifrelemeleri, çoklu hesap yönetimi ve geliştirici dostu araçları ile OpenMask, masaüstü tarayıcılarda TON ağını deneyimlemek isteyen kullanıcılar için en ideal çözümdür.",
    category: ["apps", "utilities", "wallets"],
    website_url: "https://openmask.app",
    app_url: null,
    telegram_group: "https://t.me/openmask",
    languages: ["English", "Russian"],
    x_url: "https://x.com/openmask_wallet",
    github_url: "https://github.com/OpenMask",
    youtube_url: null,
    android_url: null,
    ios_url: null
  },
  {
    id: "BOT-REAL-3006",
    slug: "safepal",
    name: "SafePal",
    desc: "SafePal, dünya genelinde milyonlarca kullanıcıya hizmet veren ve TON (The Open Network) blockchain altyapısını hem yazılımsal hem de donanımsal cüzdanlarında tam olarak destekleyen küresel ölçekte lider bir kripto para cüzdan ekosistemidir. Binance Labs tarafından desteklenen platform; mobil uygulama, tarayıcı uzantısı ve askeri düzeyde güvenliğe sahip SafePal S1 donanım cüzdanı olmak üzere üçlü bir güvenlik katmanı sunar. Kullanıcılar, Toncoin ve TON tabanlı tüm varlıklarını tamamen güvenli bir ortamda saklayabilir, dahili dApp tarayıcısı sayesinde TON DeFi protokollerine doğrudan bağlanabilir ve cüzdan içi hızlı takas (swap) özelliklerini kullanabilirler. Çoklu zincir desteği ve yüksek güvenlik standartları ile SafePal, TON ekosistemindeki varlıklarını profesyonel düzeyde korumak isteyen yatırımcıların bir numaralı tercihidir.",
    category: ["apps", "utilities", "wallets"],
    website_url: "https://safepal.com",
    app_url: null,
    telegram_group: "https://t.me/SafePal_official",
    languages: ["English", "Chinese", "Turkish", "Russian", "Spanish"],
    x_url: "https://x.com/iSafePal",
    github_url: "https://github.com/SafePalWallet",
    youtube_url: null,
    android_url: "https://play.google.com/store/apps/details?id=io.safepal.wallet",
    ios_url: "https://apps.apple.com/app/safepal-crypto-wallet/id1548297139"
  },
  {
    id: "BOT-REAL-3007",
    slug: "ton-station",
    name: "TON Station",
    desc: "TON Station, oyun sektörünün devleri SIDUS HEROES ve SuperVerse tarafından ortaklaşa geliştirilen, TON blockchain ağı üzerinde çalışan lider bir Web3 oyun dağıtım (launcher) ve sosyal madencilik platformudur. Geleneksel basit tıklama oyunlarının ötesine geçerek kaliteli Web3 oyunlarını tek bir çatı altında toplayan platform, kullanıcılarına zengin bir oyun kütüphanesi sunar. Kullanıcılar, her sekiz saatte bir uygulamaya girerek platformun yerel tokenı olan $SOON madenciliğini yapabilir, günlük görevleri (Daily Combo) tamamlayabilir ve özel turnuvalara katılarak ödüller kazanabilirler. Güçlü ortaklıkları, sürdürülebilir ekonomik modeli ve 10 milyondan fazla kayıtlı kullanıcısıyla TON Station, Telegram ekosistemindeki en prestijli oyun mağazası ve airdrop dağıtım merkezlerinden biri konumundadır.",
    category: ["apps", "games", "crypto"],
    website_url: "https://tonstation.app",
    app_url: "https://t.me/tonstationgames_bot",
    telegram_group: "https://t.me/tonstationgames",
    languages: ["English"],
    x_url: "https://x.com/tonstationgames",
    github_url: null,
    youtube_url: null,
    android_url: null,
    ios_url: null
  },
  {
    id: "BOT-REAL-3008",
    slug: "goats",
    name: "GOATS",
    desc: "GOATS, TON blockchain ağı üzerinde çalışan ve internet mem kültürünü eğlenceli mini oyunlarla birleştiren son derece popüler bir Web3 oyunlaştırma (GameFi) platformudur. Telegram botu üzerinden çalışan bu yenilikçi Mini App; yazı-tura, zar atma ve şans çarkı gibi eğlenceli ve heyecanlı mini oyunlar sunarak kullanıcıların $GOATS tokenları kazanmalarına olanak tanır. Dogs ve Cats projelerine benzer bir şekilde topluluk odaklı büyüyen platform, kullanıcıların kazandıkları puanları doğrudan TON uyumlu cüzdanlarına çekebilmelerini sağlayarak adil bir ödül mekanizması sunar. Kısa sürede 20 milyondan fazla aktif oyuncuya ulaşan GOATS, hem eğlenceli oyun dinamikleri hem de büyük borsalarda listelenen güçlü token ekonomisiyle TON ekosisteminin en başarılı memecoin projelerinden biridir.",
    category: ["apps", "games", "crypto"],
    website_url: "https://ton.goatsbot.xyz",
    app_url: "https://t.me/realgoats_bot",
    telegram_group: "https://t.me/realgoats_channel",
    languages: ["English"],
    x_url: "https://x.com/GOATS_immortal",
    github_url: null,
    youtube_url: null,
    android_url: null,
    ios_url: null
  },
  {
    id: "BOT-REAL-3009",
    slug: "tradoor",
    name: "Tradoor",
    desc: "Tradoor, TON blockchain ağı üzerinde çalışan ve Telegram Mini App entegrasyonu sayesinde doğrudan mesajlaşma uygulaması üzerinden 100x'e kadar kaldıraçla işlem yapma imkanı sunan ilk ve en hızlı merkeziyetsiz vadeli işlemler (DEX Perpetuals) ve opsiyon platformudur. Gelişmiş NDMM (Normal Dağılım Tabanlı Piyasa Yapıcı) algoritmasını kullanan platform, sıfır slipaj ve 50 milisaniye gibi rekor bir sürede işlem onayı sunarak merkezi borsaların (CEX) hızını DeFi dünyasına taşır. Kullanıcıların cüzdanlarını bağlayarak tamamen anonim ve güvenli bir şekilde Bitcoin, Ethereum ve TON vadeli işlemleri yapmalarun sağlayan Tradoor, yapay zeka destekli Quant AI asistanı sayesinde kullanıcıların ticaret stratejilerini otomatikleştirmelerine de olanak tanıyarak benzersiz bir DeFi deneyimi sunmaktadır.",
    category: ["apps", "finance", "crypto", "defi"],
    website_url: "https://tradoor.io",
    app_url: "https://t.me/tradoor_io_bot",
    telegram_group: "https://t.me/tradoor_io",
    languages: ["English", "Turkish", "Russian", "Chinese"],
    x_url: "https://x.com/tradoor_io",
    github_url: null,
    youtube_url: null,
    android_url: null,
    ios_url: null
  }
];

function getBotLink(appUrl: string | null | undefined, telegramGroup: string | null | undefined): string | null {
  if (appUrl && appUrl !== "Yok" && appUrl.trim() !== "") {
    const match = appUrl.match(/(?:t\.me|telegram\.me)\/([a-zA-Z0-9_]+)/i);
    if (match && match[1]) {
      return `@${match[1]}`;
    }
  }
  
  if (telegramGroup && telegramGroup !== "Yok" && telegramGroup.trim() !== "") {
    const match = telegramGroup.match(/(?:t\.me|telegram\.me)\/([a-zA-Z0-9_]+)/i);
    if (match && match[1]) {
      return `@${match[1]}`;
    }
  }
  
  return null;
}

function mapLanguages(langs: string[]): string[] {
  const flags: string[] = [];
  for (const lang of langs) {
    const normalized = lang.toLowerCase().trim();
    if (normalized === "english" || normalized === "multi") {
      flags.push("🇬🇧");
    } else if (normalized === "russian") {
      flags.push("🇷🇺");
    } else if (normalized === "turkish") {
      flags.push("🇹🇷");
    } else if (normalized === "ukrainian") {
      flags.push("🇺🇦");
    } else if (normalized === "chinese") {
      flags.push("🇨🇳");
    } else if (normalized === "spanish") {
      flags.push("🇪🇸");
    } else if (normalized === "portuguese") {
      flags.push("🇵🇹");
    } else if (normalized === "persian") {
      flags.push("🇮🇷");
    } else if (normalized === "french") {
      flags.push("🇫🇷");
    } else if (normalized === "german") {
      flags.push("🇩🇪");
    } else if (normalized === "cambodian" || normalized === "khmer") {
      flags.push("🇰🇭");
    } else if (normalized === "vietnamese") {
      flags.push("🇻🇳");
    }
  }
  if (flags.length === 0) {
    flags.push("🇬🇧");
  }
  return flags;
}

async function run() {
  console.log("=== STEP 1: APPLYING PART 4 APPS TO SUPABASE ===");

  for (const app of csvApps) {
    if (app.app_url && app.telegram_group && app.app_url.toLowerCase().trim() === app.telegram_group.toLowerCase().trim()) {
      throw new Error(`CRITICAL DISCREPANCY: App URL and Telegram Group/Channel URL are identical for slug '${app.slug}'. They can NEVER be identical.`);
    }

    const { data: existing, error: fetchErr } = await supabase
      .from('bots')
      .select('*')
      .eq('id', app.id)
      .maybeSingle();

    if (fetchErr) {
      console.error(`Error fetching app ${app.slug}:`, fetchErr.message);
      continue;
    }

    const categoryJson = JSON.stringify(app.category);
    const flags = mapLanguages(app.languages);
    
    const socialJson = JSON.stringify({
      github_url: app.github_url,
      x_url: app.x_url,
      youtube_url: app.youtube_url,
      android_url: app.android_url,
      ios_url: app.ios_url
    });

    const bot_link = getBotLink(app.app_url, app.telegram_group);

    const payload = {
      id: app.id,
      slug: app.slug,
      name: app.name,
      description: app.desc,
      category: categoryJson,
      website_url: app.website_url,
      app_url: app.app_url,
      telegram_group: app.telegram_group,
      bot_link: bot_link,
      social_url: socialJson,
      languages: flags
    };

    if (existing) {
      const { error: updateErr } = await supabase
        .from('bots')
        .update({
          name: payload.name,
          slug: payload.slug,
          description: payload.description,
          category: payload.category,
          website_url: payload.website_url,
          app_url: payload.app_url,
          telegram_group: payload.telegram_group,
          bot_link: payload.bot_link,
          social_url: payload.social_url,
          languages: payload.languages
        })
        .eq('id', existing.id);

      if (updateErr) {
        console.error(`❌ Failed to update ${app.name} (${existing.id}):`, updateErr.message);
      } else {
        console.log(`✅ Successfully updated existing app: ${app.name} (${existing.id})`);
      }
    } else {
      // Define a custom icon path based on random placeholder or seed
      const newPayload = {
        ...payload,
        price: 0,
        is_official: true,
        promoted_type: "none",
        views: Math.floor(4000 + Math.random() * 8000),
        rating: 4.8,
        rating_count: 70,
        user_count: 50000,
        icon: `https://picsum.photos/seed/${app.slug}/200`
      };

      const { error: insertErr } = await supabase
        .from('bots')
        .insert([newPayload]);

      if (insertErr) {
        console.error(`❌ Failed to insert ${app.name}:`, insertErr.message);
      } else {
        console.log(`✨ Successfully inserted brand new app: ${app.name} (${app.id})`);
      }
    }
  }

  console.log("\n=== STEP 2: SYNCHRONIZING LOCAL Static Database File ===");

  const arr = [...realBotsData] as any[];

  for (const app of csvApps) {
    const bot_link = getBotLink(app.app_url, app.telegram_group);
    const flags = mapLanguages(app.languages);
    const socialJsonString = JSON.stringify({
      github_url: app.github_url,
      x_url: app.x_url,
      youtube_url: app.youtube_url,
      android_url: app.android_url,
      ios_url: app.ios_url
    });

    const idx = arr.findIndex(b => b.id === app.id || b.slug === app.slug);
    if (idx !== -1) {
      arr[idx].id = app.id; 
      arr[idx].slug = app.slug; 
      arr[idx].name = app.name;
      arr[idx].description = app.desc;
      arr[idx].category = app.category;
      arr[idx].website_url = app.website_url;
      arr[idx].app_url = app.app_url;
      arr[idx].telegram_group = app.telegram_group;
      arr[idx].bot_link = bot_link;
      arr[idx].social_url = socialJsonString;
      arr[idx].languages = flags;
    } else {
      arr.push({
        id: app.id,
        name: app.name,
        slug: app.slug,
        description: app.desc,
        icon: `https://picsum.photos/seed/${app.slug}/200`,
        price: 0,
        category: app.category,
        bot_link: bot_link,
        screenshots: [],
        is_official: true,
        promoted_type: "none",
        languages: flags,
        telegram_group: app.telegram_group,
        website_url: app.website_url,
        app_url: app.app_url,
        social_url: socialJsonString,
        views: Math.floor(4000 + Math.random() * 8000),
        rating: 4.8,
        rating_count: 70,
        user_count: 50000,
        commands: ["/start"]
      });
    }
  }

  const uniqueArr: any[] = [];
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  const seenAppUrls = new Set<string>();

  for (const bot of arr) {
    const slug = bot.slug.toLowerCase().trim();
    let appUrl = bot.app_url ? bot.app_url.toLowerCase().trim() : null;
    if (appUrl) {
      appUrl = appUrl.replace(/\/$/, "");
    }

    if (seenIds.has(bot.id)) {
      console.log(`🧹 Filtered duplicate by hard ID on local file: Name="${bot.name}" ID="${bot.id}"`);
      continue;
    }
    if (seenSlugs.has(slug)) {
      console.log(`🧹 Filtered duplicate by hard Slug on local file: Name="${bot.name}" Slug="${bot.slug}"`);
      continue;
    }
    if (appUrl && seenAppUrls.has(appUrl)) {
      console.log(`🧹 Filtered duplicate by app_url value on local file: Name="${bot.name}" URL="${bot.app_url}"`);
      continue;
    }

    uniqueArr.push(bot);
    seenIds.add(bot.id);
    seenSlugs.add(slug);
    if (appUrl) {
      seenAppUrls.add(appUrl);
    }
  }

  const outputContent = `export const realBotsData = ${JSON.stringify(uniqueArr, null, 2)};\n`;
  fs.writeFileSync('./bots_data.ts', outputContent, 'utf8');
  console.log("\n✅ Done! Successfully synchronized and deduplicated bots_data.ts!");
}

run();
