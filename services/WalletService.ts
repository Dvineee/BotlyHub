
import { encryptData, decryptData } from '../security';

// Gerçek Admin Cüzdan Adresi (Ana Ağ - Mainnet)
const ADMIN_WALLET_ADDRESS = "UQD8ulQVVbEf01COyBRuy1RZtqCewT-bfv7SoVblZiBVuo_i";

export class WalletService {
    
    static getAdminAddress() {
        return ADMIN_WALLET_ADDRESS;
    }

    // --- Key Management ---
    static generateMnemonic(): string {
        // Gerçek kullanımda bip39 kütüphanesi ile üretilmelidir.
        return Array(12).fill(0).map(() => Math.random().toString(36).substring(2, 7)).join(' ');
    }

    static saveWallet(mnemonic: string) {
        const encrypted = encryptData(mnemonic);
        localStorage.setItem('secure_wallet_seed', encrypted);
        localStorage.setItem('wallet_created_at', new Date().toISOString());
    }

    static getWallet() {
        const encrypted = localStorage.getItem('secure_wallet_seed');
        if (!encrypted) return null;
        return decryptData(encrypted);
    }

    /**
     * TON Connect Transaction Payload Generator (Mainnet Ready)
     * Gerçek ana ağ transferi için Nanoton miktarını hesaplar.
     */
    static createTonTransaction(amountTON: number) {
        // Miktar Nanoton cinsine çevrilir (1 TON = 1,000,000,000 Nanoton)
        // Küsürat hatalarını önlemek için Math.floor ve String conversion kullanılır
        const nanoTons = (BigInt(Math.floor(amountTON * 1000000000))).toString();
        
        return {
            validUntil: Math.floor(Date.now() / 1000) + 600, // 10 Dakika geçerlilik (Ağ yoğunluğu payı)
            messages: [
                {
                    address: ADMIN_WALLET_ADDRESS,
                    amount: nanoTons,
                    // Opsiyonel: Payload veya yorum (Comment) eklenebilir
                    // payload: "...", 
                }
            ]
        };
    }

    static isValidAddress(chain: string, address: string): boolean {
        if (chain === 'TON') return address.length >= 48; // Standart TON adresi uzunluğu
        return address.length > 10;
    }
}
