
import CryptoJS from 'crypto-js';

// Not: Gerçek bir prodüksiyon ortamında, anahtar sunucudan alınmalı veya
// kullanıcı şifresinden türetilmelidir. Bu demo için sabit bir anahtar kullanıyoruz.
const SECRET_KEY = "botly-secure-key-v1"; 

/**
 * Cihaz Parmak İzi Oluşturucu
 * Basit bir yöntemle cihazın benzersiz kimliğini oluşturur.
 */
export const getDeviceFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const txt = 'BotlyHub Security Fingerprint 2026';
  if (ctx) {
    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125,1,62,20);
    ctx.fillStyle = "#069";
    ctx.fillText(txt, 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText(txt, 4, 17);
  }
  const result = canvas.toDataURL();
  return CryptoJS.SHA256(result + navigator.userAgent + screen.width + screen.height).toString();
};

/**
 * Telegram initData Doğrulaması
 * NOT: Bu işlem normalde GÜVENLİK gereği backend tarafında yapılmalıdır.
 * Bot Token'ı client tarafında tutmak risklidir.
 */
export const verifyTelegramInitData = (initData: string, botToken: string): boolean => {
  if (!initData || !botToken) return false;
  
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');

    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const secretKey = CryptoJS.HmacSHA256(botToken, "WebAppData");
    const calculatedHash = CryptoJS.HmacSHA256(dataCheckString, secretKey).toString();

    return calculatedHash === hash;
  } catch (e) {
    console.error("InitData verification failed:", e);
    return false;
  }
};

/**
 * Hesap Kalite Kontrolü (Heuristic Analysis)
 */
export const checkAccountQuality = (user: any): { isValid: boolean; reason?: string; trustScore: number } => {
  let score = 0;
  
  // 1. Username Kontrolü (Zorunlu)
  if (!user.username) {
    return { isValid: false, reason: "Username required", trustScore: 0 };
  }
  score += 20;

  // 2. Premium Durumu (+50 Puan)
  if (user.is_premium) {
    score += 50;
  }

  // 3. Profil Fotoğrafı (+30 Puan)
  if (user.photo_url) {
    score += 30;
  }

  // 4. Hesap Yaşı (Telegram ID üzerinden tahmin - basit bir kontrol)
  // Genellikle daha küçük ID'ler daha eski hesaplardır.
  const userId = Number(user.id);
  if (userId < 1000000000) { // 1 Milyar altı ID'ler nispeten eski
    score += 10;
  }

  return {
    isValid: score >= 30, // Minimum 30 puan geçerli sayılır
    trustScore: score,
    reason: score < 30 ? "Low trust score" : undefined
  };
};

export const encryptData = (data: string): string => {
  try {
    // Check if AES is available on the imported object (handling various CDN export shapes)
    if (CryptoJS && CryptoJS.AES) {
        return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
    }
    
    // Fallback if library didn't load fully or in mock env
    const b64 = btoa(unescape(encodeURIComponent(data)));
    return `enc_${b64}`;
  } catch (e) {
    console.error("Encryption failed", e);
    return "";
  }
};

export const decryptData = (cipherText: string): string => {
  try {
    if (!cipherText) return "";
    
    // Try AES decryption first
    if (CryptoJS && CryptoJS.AES && !cipherText.startsWith("enc_")) {
        const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    }

    // Fallback logic for simple encoding
    if (cipherText.startsWith("enc_")) {
        const b64 = cipherText.replace("enc_", "");
        return decodeURIComponent(escape(atob(b64)));
    }
    
    return "";
  } catch (e) {
    console.error("Decryption failed", e);
    return "";
  }
};

export const sanitizeInput = (input: string): string => {
  return input.replace(/[<>]/g, ""); // Basic XSS prevention
};
