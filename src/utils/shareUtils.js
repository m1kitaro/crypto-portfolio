import html2canvas from 'html2canvas';

// ポートフォリオデータをURLパラメータに変換
export const encodePortfolioToUrl = (cryptos, isPrivacyMode = false) => {
  try {
    // プライバシーモードの場合、数量と価格を除外
    const dataToEncode = isPrivacyMode ? 
      cryptos.map(crypto => ({
        symbol: crypto.symbol,
        // 数量と価格は隠す
        quantity: 0,
        price: 0
      })) : 
      cryptos;
    
    const data = JSON.stringify(dataToEncode);
    const encoded = btoa(encodeURIComponent(data));
    const url = new URL(window.location.href);
    url.searchParams.set('portfolio', encoded);
    
    // プライバシーモードフラグも追加
    if (isPrivacyMode) {
      url.searchParams.set('privacy', 'true');
    }
    
    return url.toString();
  } catch (error) {
    console.error('URL生成エラー:', error);
    return null;
  }
};

// 短縮URLを生成
export const createShortUrl = async (longUrl) => {
  try {
    const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
    
    if (!response.ok) {
      throw new Error(`短縮URL生成失敗: ${response.status}`);
    }
    
    const shortUrl = await response.text();
    
    // TinyURLが返すエラーをチェック
    if (shortUrl.includes('Error') || shortUrl.includes('Invalid')) {
      throw new Error('短縮URL生成に失敗しました');
    }
    
    return shortUrl;
  } catch (error) {
    console.error('短縮URL生成エラー:', error);
    throw error;
  }
};

// ポートフォリオの短縮共有URLを生成（プライバシーモード対応）
export const generateShortShareUrl = async (cryptos, isPrivacyMode = false) => {
  try {
    const longUrl = encodePortfolioToUrl(cryptos, isPrivacyMode);
    if (!longUrl) {
      throw new Error('URL生成に失敗しました');
    }
    
    const shortUrl = await createShortUrl(longUrl);
    return shortUrl;
  } catch (error) {
    console.error('短縮共有URL生成エラー:', error);
    throw error;
  }
};

// URLパラメータからポートフォリオデータを復元
export const decodePortfolioFromUrl = () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const encoded = urlParams.get('portfolio');
    const isPrivacy = urlParams.get('privacy') === 'true';
    
    if (!encoded) {
      return null;
    }
    
    const decoded = decodeURIComponent(atob(encoded));
    const data = JSON.parse(decoded);
    
    // データの妥当性をチェック
    if (Array.isArray(data) && data.every(item => 
      item.symbol && 
      typeof item.quantity === 'number' && 
      typeof item.price === 'number'
    )) {
      // プライバシーモードの場合、適切なプレースホルダー値を設定
      if (isPrivacy) {
        return data.map(item => ({
          ...item,
          quantity: item.quantity === 0 ? 1 : item.quantity, // デフォルト値
          price: item.price === 0 ? 1000000 : item.price // デフォルト値（¥1,000,000）
        }));
      }
      
      return data;
    }
    
    return null;
  } catch (error) {
    console.error('URL復元エラー:', error);
    return null;
  }
};

// チャートを画像として取得
export const captureChartAsImage = async (chartRef) => {
  try {
    if (!chartRef.current) {
      throw new Error('チャート要素が見つかりません');
    }

    const canvas = await html2canvas(chartRef.current, {
      backgroundColor: 'white',
      scale: 2, // 高解像度
      logging: false,
      useCORS: true,
      allowTaint: true
    });

    return canvas;
  } catch (error) {
    console.error('画像キャプチャエラー:', error);
    throw error;
  }
};

// キャンバスを画像ファイルとしてダウンロード
export const downloadCanvasAsImage = (canvas, filename = 'crypto-portfolio') => {
  try {
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('ダウンロードエラー:', error);
    throw error;
  }
};

// キャンバスをクリップボードにコピー
export const copyCanvasToClipboard = async (canvas) => {
  try {
    if (!navigator.clipboard || !window.ClipboardItem) {
      throw new Error('クリップボード機能がサポートされていません');
    }

    canvas.toBlob(async (blob) => {
      try {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
      } catch (error) {
        console.error('クリップボードコピーエラー:', error);
        throw error;
      }
    }, 'image/png');
  } catch (error) {
    console.error('クリップボードコピーエラー:', error);
    throw error;
  }
};

// 共有URL用のテキストを生成
export const generateShareText = (cryptos, totalValue) => {
  const symbolsList = cryptos.map(crypto => crypto.symbol).join(', ');
  const totalValueFormatted = totalValue.toLocaleString();
  
  return `📊 Investment Portfolio Analysis\n` +
         `🎯 Asset Allocation: ${symbolsList}\n` +
         `💼 Total Value: ¥${totalValueFormatted}\n` +
         `#CryptoPortfolio`;
};

// プライバシーモード用の共有テキストを生成
export const generatePrivateShareText = (cryptos) => {
  const symbolsList = cryptos.map(crypto => crypto.symbol).join(', ');
  
  return `📊 Investment Portfolio Analysis\n` +
         `🎯 Diversified Holdings: ${symbolsList}\n` +
         `🔒 Private Portfolio Dashboard\n` +
         `#CryptoPortfolio`;
}; 