import httpx
import re
import asyncio
import time
from core.config import logger

# Regex'leri önceden derliyoruz (Hız artışı ve bellek tasarrufu)
VIEWS_REGEX = re.compile(
    r'<span[^>]*class="(?:[^"]*\s)?(?:tgme_widget_message_views|tgme_widget_message_views_[^"]*)[^"]*"[^>]*>(.*?)</span>', 
    re.IGNORECASE
)
FALLBACK_VIEWS_REGEX = re.compile(r'<span[^>]*class="(?:[^"]*\s)?views(?:[^"]*\s)?"[^>]*>(.*?)</span>', re.IGNORECASE)
REACTIONS_REGEX = re.compile(
    r'<span[^>]*class="(?:[^"]*\s)?tgme_widget_message_reaction_count[^"]*"[^>]*>(.*?)</span>', 
    re.IGNORECASE
)
HTML_TAG_REGEX = re.compile(r'<[^>]+>')
PARSE_MATCH_REGEX = re.compile(r'([\d\.,]+)\s*([KM]?)')
PARSE_SUB_REGEX = re.compile(r'[^\d\.,]')

# Global HTTP Client: Connection pooling (Bağlantı havuzu) sayesinde her defasında 
# yeni TCP/TLS bağlantısı açılmaz, aşırı hızlandırır ve hataları/reddedilmeleri (timeout) azaltır.
http_client = httpx.AsyncClient(
    timeout=httpx.Timeout(8.0, connect=3.0),
    limits=httpx.Limits(max_keepalive_connections=100, max_connections=200, keepalive_expiry=30.0),
    headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Connection": "keep-alive"
    }
)

def parse_views(views_str: str) -> int:
    if not views_str: return 0
    views_str = views_str.upper().strip()
    match = PARSE_MATCH_REGEX.search(views_str)
    if not match:
        try:
            val_str = PARSE_SUB_REGEX.sub('', views_str).replace(',', '.')
            if not val_str: return 0
            return int(float(val_str))
        except:
            return 0
    
    val_str = match.group(1).replace(',', '.')
    unit = match.group(2)
    
    try:
        val = float(val_str)
        if unit == 'K': return int(val * 1000)
        if unit == 'M': return int(val * 1000000)
        return int(val)
    except:
        return 0

async def get_telegram_stats(username: str, message_id: int) -> tuple[int, int]:
    if not username or not message_id: return 0, 0
    
    # "@" işareti varsa temizleyelim
    username = username.lstrip("@")
    
    # Telegram web cache'inden (önbellek) eski verinin gelmemesini %100 
    # garanti altına almak için saniyelik anti-cache zaman damgası ekliyoruz:
    url = f"https://t.me/{username}/{message_id}?embed=1&_rnd={int(time.time())}"
    
    for attempt in range(2):
        try:
            # Global client kullanımı (Aşırı hızlı, önceki bağlantılar yeniden kullanılır - reuse socket)
            resp = await http_client.get(url)
            
            if resp.status_code == 200:
                html = resp.text
                
                # İzlenme parse işlemi
                views_match = VIEWS_REGEX.search(html)
                if not views_match:
                    views_match = FALLBACK_VIEWS_REGEX.search(html)

                views = 0
                if views_match:
                    views_text = HTML_TAG_REGEX.sub('', views_match.group(1))
                    views = parse_views(views_text)

                # Tepki (Reaction) parse işlemi
                reactions = 0
                for match in REACTIONS_REGEX.finditer(html):
                    react_text = HTML_TAG_REGEX.sub('', match.group(1))
                    reactions += parse_views(react_text)

                return views, reactions
                
            elif resp.status_code == 429:
                # Çok fazla istek atıldığında sunucu beklememizi isteyebilir
                logger.warning(f"⚠️ [429] Rate Limit ({username}/{message_id}) - Bekleniyor... (Deneme: {attempt+1})")
                await asyncio.sleep(2 + attempt) # Giderek artan bekleme süresi
            else:
                # Telegram sayfası yoksa veya diğer hata
                logger.debug(f"⚠️ Scrape HTTP {resp.status_code} ({username}/{message_id})")
                break # 429 harici bir durumsa direkt aramayı iptal et ve 0 dön
                
        except httpx.ConnectTimeout:
            logger.error(f"❌ Scrape Timeout ({username}/{message_id})")
            await asyncio.sleep(1)
        except Exception as e:
            logger.error(f"❌ Scrape Error ({username}/{message_id}): {e}")
            await asyncio.sleep(1)
            
    return 0, 0
