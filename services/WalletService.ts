
import { beginCell } from 'ton-core';
import { SecurityUtils } from './SecurityUtils';

// Kullanıcı tarafından belirtilen Admin Cüzdan Adresi (TON Mainnet)
const ADMIN_WALLET_ADDRESS = "UQD8ulQVVbEf01COyBRuy1RZtqCewT-bfv7SoVblZiBVuo_i";

export class WalletService {
    
    static getAdminAddress() {
        return ADMIN_WALLET_ADDRESS;
    }

    /**
     * TON Connect Transaction Payload Generator
     * Admin adresine ödeme gönderimi için kullanılır.
     * @param amountTON The amount in TON
     * @param orderId The unique order ID
     * @param userId The user's Telegram ID
     */
    static createTonTransaction(amountTON: number, orderId: string, userId: string) {
        const nanoTons = (BigInt(Math.floor(amountTON * 1000000000))).toString();
        
        // Create a SIGNED payload: orderId|userId|timestamp|signature
        const signedPayload = SecurityUtils.createSignedPaymentString(orderId, userId);
        
        // Create a comment payload with the signed string
        const payload = beginCell()
            .storeUint(0, 32)
            .storeStringTail(signedPayload)
            .endCell()
            .toBoc()
            .toString('base64');

        return {
            validUntil: Math.floor(Date.now() / 1000) + 600,
            messages: [
                {
                    address: ADMIN_WALLET_ADDRESS,
                    amount: nanoTons,
                    payload: payload
                }
            ]
        };
    }
}
