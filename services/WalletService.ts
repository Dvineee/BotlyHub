
import { encryptData, decryptData } from '../security';
import { CryptoTransaction } from '../types';

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

    // --- TON Connect Transaction Payload Generator (Mainnet Ready) ---
    static createTonTransaction(amountTON: number) {
        // Miktar Nanoton cinsine çevrilir (1 TON = 10^9 Nanoton)
        const nanoTons = Math.floor(amountTON * 1000000000).toString();
        
        return {
            validUntil: Math.floor(Date.now() / 1000) + 360, // 6 Dakika geçerlilik
            messages: [
                {
                    address: ADMIN_WALLET_ADDRESS,
                    amount: nanoTons,
                }
            ]
        };
    }

    static isValidAddress(chain: string, address: string): boolean {
        if (chain === 'TON') return address.length > 30; // Temel TON adres kontrolü
        return address.length > 10;
    }
}
