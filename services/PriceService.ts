
export interface PriceData {
    tonTry: number;
    tonUsd: number;
    lastUpdate: number;
}

class PriceService {
    private static cache: PriceData | null = null;
    private static CACHE_DURATION = 120000; // 2 Dakika

    static async getTonPrice(): Promise<PriceData> {
        const now = Date.now();
        
        if (this.cache && (now - this.cache.lastUpdate) < this.CACHE_DURATION) {
            return this.cache;
        }

        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=try,usd');
            const data = await response.json();
            
            const tonData = data['the-open-network'];
            
            this.cache = {
                tonTry: tonData.try,
                tonUsd: tonData.usd,
                lastUpdate: now
            };
            return this.cache;
        } catch (error) {
            console.error("Fiyat çekme hatası:", error);
            return this.cache || { tonTry: 250, tonUsd: 7.2, lastUpdate: now };
        }
    }

    /**
     * TL tutarını sadece TON birimine dönüştürür.
     * Stars (Yıldız) sistemi kaldırılmıştır.
     */
    static convert(tl: number, tonRate: number) {
        const amount = Number(tl) || 0;
        return {
            ton: parseFloat((amount / tonRate).toFixed(3))
        };
    }
}

export default PriceService;
