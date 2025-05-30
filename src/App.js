import React, { useState, useEffect } from 'react';
import './App.css';
import CryptoForm from './components/CryptoForm';
import PortfolioChart from './components/PortfolioChart';
import CryptoList from './components/CryptoList';
import { decodePortfolioFromUrl, generateShortShareUrl } from './utils/shareUtils';

function App() {
  const [cryptos, setCryptos] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [shareUrl, setShareUrl] = useState('');
  const [showShareUrl, setShowShareUrl] = useState(false);
  const [isGeneratingUrl, setIsGeneratingUrl] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);

  useEffect(() => {
    // URLパラメータからポートフォリオを復元
    const urlPortfolio = decodePortfolioFromUrl();
    if (urlPortfolio) {
      // IDを付与
      const portfolioWithIds = urlPortfolio.map((crypto, index) => ({
        ...crypto,
        id: Date.now() + index
      }));
      setCryptos(portfolioWithIds);
    } else {
      // ローカルストレージから復元
      const savedCryptos = localStorage.getItem('cryptoPortfolio');
      if (savedCryptos) {
        setCryptos(JSON.parse(savedCryptos));
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cryptoPortfolio', JSON.stringify(cryptos));
    const total = cryptos.reduce((acc, crypto) => acc + (crypto.quantity * crypto.price), 0);
    setTotalValue(total);
  }, [cryptos]);

  const addCrypto = (crypto) => {
    setCryptos([...cryptos, { ...crypto, id: Date.now() }]);
  };

  const deleteCrypto = (id) => {
    setCryptos(cryptos.filter(crypto => crypto.id !== id));
  };

  const generateShareUrl = async () => {
    if (cryptos.length === 0) {
      alert('共有するポートフォリオがありません');
      return;
    }
    
    setIsGeneratingUrl(true);
    setUrlError('');
    
    try {
      const shortUrl = await generateShortShareUrl(cryptos, isPrivacyMode);
      setShareUrl(shortUrl);
      setShowShareUrl(true);
    } catch (error) {
      setUrlError('短縮URLの生成に失敗しました。しばらく待ってから再試行してください。');
      console.error('短縮URL生成エラー:', error);
    } finally {
      setIsGeneratingUrl(false);
    }
  };

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('📋 短縮URLをクリップボードにコピーしました！');
    } catch (error) {
      alert('コピーに失敗しました');
    }
  };

  const closeShareModal = () => {
    setShowShareUrl(false);
    setShareUrl('');
    setUrlError('');
  };

  const togglePrivacyMode = () => {
    setIsPrivacyMode(!isPrivacyMode);
  };

  return (
    <div className="App">
      <div className="container">
        <header className="app-header fade-in-up">
          <h1 className="title bounce">
            <span className="emoji">🌈</span>
            Crypto Portfolio
            <span className="emoji">💎</span>
          </h1>
          <p className="author-info">
            <span className="emoji">👩‍💻</span>
            Created by{' '}
            <a 
              href="https://x.com/becky_mining" 
              target="_blank" 
              rel="noopener noreferrer"
              className="author-link"
            >
              @becky_mining
            </a>
          </p>
          
          {cryptos.length > 0 && (
            <div className="header-actions">
              <div className="privacy-toggle">
                <label className="privacy-label">
                  <input
                    type="checkbox"
                    checked={isPrivacyMode}
                    onChange={togglePrivacyMode}
                    className="privacy-checkbox"
                  />
                  <span className="privacy-slider"></span>
                  <span className="privacy-text">
                    <span className="emoji">🔒</span>
                    プライバシーモード（共有時に数量・価格を隠す）
                  </span>
                </label>
              </div>
              
              <button 
                onClick={generateShareUrl} 
                disabled={isGeneratingUrl}
                className="share-url-btn"
              >
                {isGeneratingUrl ? (
                  <>
                    <span className="spinner"></span>
                    短縮URL生成中...
                  </>
                ) : (
                  <>
                    <span className="emoji">🔗</span>
                    ポートフォリオを共有
                  </>
                )}
              </button>
            </div>
          )}
        </header>

        <div className="content-grid">
          <div className="form-section fade-in-up">
            <CryptoForm onAddCrypto={addCrypto} />
          </div>

          <div className="chart-section fade-in-up">
            <div className="chart-container">
              <h3 className="section-title">
                <span className="emoji">📊</span>
                ポートフォリオ
              </h3>
              {cryptos.length > 0 ? (
                <>
                  <PortfolioChart 
                    cryptos={cryptos} 
                    totalValue={totalValue} 
                    isPrivacyMode={isPrivacyMode}
                  />
                  <div className="total-value">
                    <span className="emoji">💰</span>
                    合計: {isPrivacyMode ? '¥*****' : `¥${totalValue.toLocaleString()}`}
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <span className="emoji big">📈</span>
                  <p>仮想通貨を追加してポートフォリオを作成しましょう！</p>
                </div>
              )}
            </div>
          </div>

          <div className="list-section fade-in-up">
            <CryptoList cryptos={cryptos} onDeleteCrypto={deleteCrypto} isPrivacyMode={isPrivacyMode} />
          </div>
        </div>

        {/* Share URL Modal */}
        {showShareUrl && (
          <div className="modal-overlay" onClick={closeShareModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3 className="modal-title">
                <span className="emoji">🔗</span>
                短縮共有URL
              </h3>
              <p className="modal-description">
                <span className="emoji">✨</span>
                短縮URLを生成しました！このURLを共有することで、あなたのポートフォリオを他の人に見せることができます。
                {isPrivacyMode && (
                  <span className="privacy-notice">
                    <br />
                    <span className="emoji">🔒</span>
                    プライバシーモードがオンのため、数量・価格は表示されません。
                  </span>
                )}
              </p>
              <div className="url-container">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="url-input"
                />
                <button onClick={copyShareUrl} className="copy-url-btn">
                  <span className="emoji">📋</span>
                  コピー
                </button>
              </div>
              <div className="url-info">
                <span className="emoji">🎯</span>
                短縮URLで共有しやすくなりました！
              </div>
              <div className="modal-actions">
                <button onClick={closeShareModal} className="close-btn">
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}

        {/* URL Generation Error */}
        {urlError && (
          <div className="error-notification">
            <div className="error-content">
              <span className="emoji">⚠️</span>
              {urlError}
              <button onClick={() => setUrlError('')} className="error-close">
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 