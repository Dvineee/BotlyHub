import crypto from 'crypto';

const PAYMENT_SECRET = process.env.PAYMENT_SECRET || 'fallback-secret-for-dev-only-1234567890';

export class SecurityUtils {
    /**
     * Generates a HMAC signature for a payment payload
     * @param payload The payload to sign (e.g., orderId|userId|timestamp)
     */
    static signPayload(payload: string): string {
        return crypto
            .createHmac('sha256', PAYMENT_SECRET)
            .update(payload)
            .digest('hex');
    }

    /**
     * Verifies a HMAC signature for a payment payload
     * @param payload The payload that was signed
     * @param signature The signature to verify
     */
    static verifySignature(payload: string, signature: string): boolean {
        const expectedSignature = this.signPayload(payload);
        // Use timingSafeEqual to prevent timing attacks
        try {
            return crypto.timingSafeEqual(
                Buffer.from(signature, 'hex'),
                Buffer.from(expectedSignature, 'hex')
            );
        } catch (e) {
            return false;
        }
    }

    /**
     * Creates a signed payment string: orderId|userId|timestamp|signature
     */
    static createSignedPaymentString(orderId: string, userId: string): string {
        const timestamp = Date.now();
        const payload = `${orderId}|${userId}|${timestamp}`;
        const signature = this.signPayload(payload);
        return `${payload}|${signature}`;
    }

    /**
     * Parses and verifies a signed payment string
     * @param signedString The string to parse (orderId|userId|timestamp|signature)
     * @returns The parsed data if valid, null otherwise
     */
    static parseAndVerifyPaymentString(signedString: string): { orderId: string, userId: string, timestamp: number } | null {
        const parts = signedString.split('|');
        if (parts.length !== 4) return null;

        const [orderId, userId, timestampStr, signature] = parts;
        const timestamp = parseInt(timestampStr, 10);
        const payload = `${orderId}|${userId}|${timestampStr}`;

        // 1. Verify signature
        if (!this.verifySignature(payload, signature)) {
            console.warn(`[SECURITY] Invalid signature for payload: ${payload}`);
            return null;
        }

        // 2. Verify timestamp (prevent replay of very old payloads, e.g., > 1 hour)
        const oneHour = 60 * 60 * 1000;
        if (Date.now() - timestamp > oneHour) {
            console.warn(`[SECURITY] Expired payload: ${payload}`);
            return null;
        }

        return { orderId, userId, timestamp };
    }
}
