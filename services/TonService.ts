import axios from 'axios';
import { SecurityUtils } from './SecurityUtils';

const ADMIN_WALLET_ADDRESS = "UQD8ulQVVbEf01COyBRuy1RZtqCewT-bfv7SoVblZiBVuo_i";

export interface VerificationResult {
    success: boolean;
    error?: string;
    data?: {
        orderId: string;
        userId: string;
        amount: number;
    };
}

export class TonService {
    /**
     * Verifies a TON transaction using TonAPI
     * @param txHash The transaction hash (hex or base64)
     * @param expectedAmount Expected amount in TON
     * @param expectedOrderId Expected order ID
     * @param expectedUserId Expected user ID
     */
    static async verifyTransaction(
        txHash: string, 
        expectedAmount: number, 
        expectedOrderId: string,
        expectedUserId: string,
        expectedSenderAddress: string
    ): Promise<VerificationResult> {
        const maxRetries = 8;
        const delay = 5000; // 5 seconds

        for (let i = 0; i < maxRetries; i++) {
            try {
                console.log(`[VERIFY] Attempt ${i + 1} for tx: ${txHash}`);
                
                const response = await axios.get(`https://tonapi.io/v2/events/${txHash}`);
                const event = response.data;

                if (!event) throw new Error("Event not found");
                if (event.in_progress) throw new Error("Transaction in progress");

                // 1. Find the transfer to our admin wallet
                const transferAction = event.actions.find((action: any) => 
                    action.type === 'TonTransfer' && 
                    this.normalizeAddress(action.TonTransfer.recipient.address) === this.normalizeAddress(ADMIN_WALLET_ADDRESS)
                );

                if (!transferAction) {
                    return { success: false, error: "No transfer to admin wallet found" };
                }

                const transfer = transferAction.TonTransfer;
                
                // 2. Validate Sender (Wallet Ownership Verification)
                const actualSender = transfer.sender.address;
                if (this.normalizeAddress(actualSender) !== this.normalizeAddress(expectedSenderAddress)) {
                    console.warn(`[SECURITY] Sender mismatch for tx ${txHash}. Expected ${expectedSenderAddress}, got ${actualSender}`);
                    return { success: false, error: "Sender address mismatch. Please use the same wallet you connected with." };
                }

                // 3. Validate Amount (with tolerance)
                const actualAmount = Number(transfer.amount) / 1000000000;
                const tolerance = 0.0001;
                if (Math.abs(actualAmount - expectedAmount) > tolerance) {
                    console.warn(`[SECURITY] Amount mismatch for tx ${txHash}. Expected ${expectedAmount}, got ${actualAmount}`);
                    return { success: false, error: "Amount mismatch" };
                }

                // 4. Validate Signed Payload (Comment)
                const comment = transfer.comment;
                if (!comment) {
                    return { success: false, error: "Missing transaction comment" };
                }

                const verifiedPayload = SecurityUtils.parseAndVerifyPaymentString(comment);
                if (!verifiedPayload) {
                    console.warn(`[SECURITY] Payload verification failed for tx ${txHash}. Comment: ${comment}`);
                    return { success: false, error: "Invalid transaction payload" };
                }

                // 5. Cross-check payload data with expected data
                if (verifiedPayload.orderId !== expectedOrderId) {
                    console.warn(`[SECURITY] Order ID mismatch. Payload: ${verifiedPayload.orderId}, Expected: ${expectedOrderId}`);
                    return { success: false, error: "Order ID mismatch" };
                }

                if (verifiedPayload.userId !== expectedUserId) {
                    console.warn(`[SECURITY] User ID mismatch. Payload: ${verifiedPayload.userId}, Expected: ${expectedUserId}`);
                    return { success: false, error: "User ID mismatch" };
                }

                // 6. Confirmation Depth Protection
                // Ensure the transaction is at least 20 seconds old (approx 2-3 blocks)
                const now = Math.floor(Date.now() / 1000);
                const age = now - event.timestamp;
                if (age < 20) {
                    console.log(`[VERIFY] Transaction too recent (${age}s old). Waiting for confirmation depth...`);
                    throw new Error("Waiting for confirmation depth");
                }

                return { 
                    success: true,
                    data: {
                        orderId: verifiedPayload.orderId,
                        userId: verifiedPayload.userId,
                        amount: actualAmount
                    }
                };
            } catch (error: any) {
                if (i === maxRetries - 1) {
                    const errMsg = error.response?.data?.error || error.message;
                    return { success: false, error: `Verification failed after ${maxRetries} attempts: ${errMsg}` };
                }
                console.log(`[VERIFY] Waiting for indexing or confirmation... (${i + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        return { success: false, error: "Verification timed out" };
    }

    private static normalizeAddress(address: string): string {
        return address.trim().toLowerCase();
    }
}
