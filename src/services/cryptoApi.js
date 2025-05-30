// CoinGecko API を使用した仮想通貨価格取得サービス

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

// 通貨シンボルから CoinGecko の ID にマッピング
const SYMBOL_TO_ID_MAP = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'ADA': 'cardano',
  'DOT': 'polkadot',
  'LINK': 'chainlink',
  'LTC': 'litecoin',
  'XRP': 'ripple',
  'BCH': 'bitcoin-cash',
  'BNB': 'binancecoin',
  'SOL': 'solana',
  'MATIC': 'matic-network',
  'AVAX': 'avalanche-2',
  'UNI': 'uniswap',
  'ATOM': 'cosmos',
  'XLM': 'stellar',
  'VET': 'vechain',
  'FIL': 'filecoin',
  'TRX': 'tron',
  'ETC': 'ethereum-classic',
  'THETA': 'theta-token',
  'ALGO': 'algorand',
  'XMR': 'monero',
  'AAVE': 'aave',
  'MKR': 'maker',
  'COMP': 'compound-governance-token',
  'SNX': 'havven'
};

// 汎用fetch関数（タイムアウトとリトライ付き）
const fetchWithRetry = async (url, options = {}, retries = 3, timeout = 10000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // APIレート制限の場合は少し待ってからリトライ
        if (response.status === 429) {
          const waitTime = Math.pow(2, i) * 1000; // 指数バックオフ
          console.log(`レート制限に達しました。${waitTime}ms後にリトライします...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        // その他のHTTPエラー
        if (i === retries - 1) {
          throw new Error(`API エラー: ${response.status} ${response.statusText}`);
        }
        continue;
      }
      
      return response;
      
    } catch (error) {
      console.warn(`試行 ${i + 1}/${retries} 失敗:`, error.message);
      
      // 最後の試行でもエラーの場合
      if (i === retries - 1) {
        if (error.name === 'AbortError') {
          throw new Error(`リクエストがタイムアウトしました（${timeout}ms）。ネットワーク接続を確認してください。`);
        }
        
        if (error.message.includes('Failed to fetch')) {
          throw new Error(`ネットワークエラーが発生しました。インターネット接続を確認してください。`);
        }
        
        throw error;
      }
      
      // リトライ前に少し待機
      const waitTime = Math.pow(2, i) * 500;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

// シンボルから価格を取得する関数
export const getCryptoPriceBySymbol = async (symbol) => {
  try {
    const upperSymbol = symbol.toUpperCase();
    const coinId = SYMBOL_TO_ID_MAP[upperSymbol];
    
    if (!coinId) {
      // マッピングにない場合は、CoinGecko の検索 API を使用
      console.log(`通貨 ${symbol} をCoinGecko APIで検索中...`);
      
      const searchResponse = await fetchWithRetry(
        `${COINGECKO_API_BASE}/search?query=${encodeURIComponent(symbol)}`
      );
      const searchData = await searchResponse.json();
      
      if (!searchData.coins || searchData.coins.length === 0) {
        throw new Error(`通貨シンボル "${symbol}" が見つかりませんでした。正しいシンボルを入力してください。`);
      }
      
      // 最初にマッチした結果を使用
      const foundCoin = searchData.coins.find(coin => 
        coin.symbol.toUpperCase() === upperSymbol
      );
      
      if (!foundCoin) {
        // 完全一致しない場合は最初の結果を使用
        const firstCoin = searchData.coins[0];
        console.log(`完全一致なし。${firstCoin.name} (${firstCoin.symbol})を使用します`);
        
        const priceResponse = await fetchWithRetry(
          `${COINGECKO_API_BASE}/simple/price?ids=${firstCoin.id}&vs_currencies=jpy`
        );
        const priceData = await priceResponse.json();
        
        if (!priceData[firstCoin.id] || !priceData[firstCoin.id].jpy) {
          throw new Error(`価格情報を取得できませんでした`);
        }
        
        return {
          price: priceData[firstCoin.id].jpy,
          name: firstCoin.name,
          symbol: firstCoin.symbol.toUpperCase()
        };
      }
      
      const priceResponse = await fetchWithRetry(
        `${COINGECKO_API_BASE}/simple/price?ids=${foundCoin.id}&vs_currencies=jpy`
      );
      const priceData = await priceResponse.json();
      
      if (!priceData[foundCoin.id] || !priceData[foundCoin.id].jpy) {
        throw new Error(`価格情報を取得できませんでした`);
      }
      
      return {
        price: priceData[foundCoin.id].jpy,
        name: foundCoin.name,
        symbol: upperSymbol
      };
    }
    
    // マッピングがある場合は直接価格を取得
    console.log(`通貨 ${symbol} の価格を取得中...`);
    const response = await fetchWithRetry(
      `${COINGECKO_API_BASE}/simple/price?ids=${coinId}&vs_currencies=jpy`
    );
    
    const data = await response.json();
    
    if (!data[coinId] || typeof data[coinId].jpy !== 'number') {
      throw new Error(`価格情報を取得できませんでした`);
    }
    
    return {
      price: data[coinId].jpy,
      name: coinId,
      symbol: upperSymbol
    };
    
  } catch (error) {
    console.error('価格取得エラー:', error);
    
    // エラーメッセージを分かりやすく変換
    let userFriendlyMessage = error.message;
    
    if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
      userFriendlyMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してもう一度お試しください。';
    } else if (error.message.includes('timeout')) {
      userFriendlyMessage = 'リクエストがタイムアウトしました。しばらく待ってから再度お試しください。';
    } else if (error.message.includes('429') || error.message.includes('rate limit')) {
      userFriendlyMessage = 'APIの利用制限に達しました。しばらく待ってから再度お試しください。';
    }
    
    throw new Error(userFriendlyMessage);
  }
};

// 複数の通貨の価格を一度に取得する関数
export const getMultipleCryptoPrices = async (symbols) => {
  try {
    const ids = symbols
      .map(symbol => SYMBOL_TO_ID_MAP[symbol.toUpperCase()])
      .filter(Boolean);
    
    if (ids.length === 0) {
      throw new Error('有効な通貨シンボルがありません');
    }
    
    const response = await fetchWithRetry(
      `${COINGECKO_API_BASE}/simple/price?ids=${ids.join(',')}&vs_currencies=jpy`
    );
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('複数価格取得エラー:', error);
    throw error;
  }
}; 