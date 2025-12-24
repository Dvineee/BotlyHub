
export interface PriceData {
    tonTry: number;
    tonUsd: number;
    lastUpdate: number;
}

class PriceService {
    private static cache: PriceData | null = null;
    private static CACHE_DURATION = 120000; // 2 Dakika (API limitlerini korumak için)

    static async getTonPrice(): Promise<PriceData> {
        const now = Date.now();
        
        if (this.cache && (now - this.cache.lastUpdate) < this.CACHE_DURATION) {
            return this.cache;
        }

        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=toncoin&vs_currencies=try,usd');
            const data = await response.json();
            
            this.cache = {
                tonTry: data.toncoin.try,
                tonUsd: data.toncoin.usd,
                lastUpdate: now
            };
            return this.cache;
        } catch (error) {
            console.error("Fiyat çekme hatası:", error);
            // Fallback (API hatası durumunda son başarılı fiyatı veya güvenli bir tahmini dön)
            return this.cache || { tonTry: 250, tonUsd: 7.2, lastUpdate: now };
        }
    }

    /**
     * TL tutarını Stars ve TON birimlerine dönüştürür.
     * Stars: 1 TL ~ 1.4 Stars (Sabit kur)
     * TON: Güncel borsa fiyatı üzerinden
     */
    static convert(tl: number, tonRate: number) {
        const amount = Number(tl) || 0;
        return {
            stars: Math.round(amount * 1.4),
            ton: parseFloat((amount / tonRate).toFixed(3))
        };
    }
}

export default PriceService;
