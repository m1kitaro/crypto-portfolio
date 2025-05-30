import React, { useState, useEffect } from 'react';
import './App.css';
import CryptoForm from './components/CryptoForm';
import PortfolioChart from './components/PortfolioChart';
import CryptoList from './components/CryptoList';

function App() {
  const [cryptos, setCryptos] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);

  useEffect(() => {
    // ローカルストレージから復元
    const savedCryptos = localStorage.getItem('cryptoPortfolio');
    if (savedCryptos) {
      setCryptos(JSON.parse(savedCryptos));
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
      </div>
    </div>
  );
}

export default App; 