import React from 'react';
import './CryptoList.css';

const CryptoList = ({ cryptos, onDeleteCrypto, isPrivacyMode = false }) => {
  return (
    <div className="crypto-list">
      <h3 className="list-title">
        <span className="emoji">📋</span>
        保有通貨
        {isPrivacyMode && (
          <span className="privacy-indicator">
            <span className="emoji">🔒</span>
          </span>
        )}
      </h3>
      {cryptos.length === 0 ? (
        <div className="empty-list">
          <span className="emoji">🌟</span>
          <p>まだ通貨が追加されていません</p>
        </div>
      ) : (
        <div className="crypto-items">
          {cryptos.map((crypto) => (
            <div key={crypto.id} className="crypto-item fade-in-up">
              <div className="crypto-info">
                <div className="crypto-symbol">
                  <span className="emoji">💰</span>
                  {crypto.symbol}
                </div>
                <div className="crypto-details">
                  <div className="detail-row">
                    <span>数量:</span>
                    <span>{isPrivacyMode ? '***' : crypto.quantity}</span>
                  </div>
                  <div className="detail-row">
                    <span>価格:</span>
                    <span>{isPrivacyMode ? '¥****' : `¥${crypto.price.toLocaleString()}`}</span>
                  </div>
                  <div className="detail-row total">
                    <span>合計:</span>
                    <span>{isPrivacyMode ? '¥****' : `¥${(crypto.quantity * crypto.price).toLocaleString()}`}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onDeleteCrypto(crypto.id)}
                className="delete-btn"
                title="削除"
              >
                <span className="emoji">🗑️</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CryptoList; 