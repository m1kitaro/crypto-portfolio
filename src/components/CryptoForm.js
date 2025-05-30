import React, { useState } from 'react';
import './CryptoForm.css';
import { getCryptoPriceBySymbol } from '../services/cryptoApi';

const CryptoForm = ({ onAddCrypto }) => {
  const [formData, setFormData] = useState({
    symbol: '',
    quantity: '',
    price: ''
  });
  
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [priceError, setPriceError] = useState('');
  const [lastSuccessfulSymbol, setLastSuccessfulSymbol] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // 価格エラーをクリア（シンボルまたは価格が変更された時）
    if (e.target.name === 'price' || e.target.name === 'symbol') {
      setPriceError('');
    }
  };

  const resetErrorState = () => {
    setPriceError('');
    setIsLoadingPrice(false);
  };

  const fetchPrice = async () => {
    const symbol = formData.symbol.trim();
    
    if (!symbol) {
      setPriceError('シンボルを入力してください');
      return;
    }

    // エラー状態をリセット
    resetErrorState();
    setIsLoadingPrice(true);

    try {
      console.log(`価格取得開始: ${symbol}`);
      const priceData = await getCryptoPriceBySymbol(symbol);
      
      console.log('価格取得成功:', priceData);
      setFormData(prev => ({
        ...prev,
        price: priceData.price.toString()
      }));
      
      setLastSuccessfulSymbol(symbol.toUpperCase());
      
      // 成功メッセージを一時的に表示
      setPriceError(`✅ ${priceData.symbol}の価格を取得しました: ¥${priceData.price.toLocaleString()}`);
      setTimeout(() => {
        setPriceError('');
      }, 3000);
      
    } catch (error) {
      console.error('価格取得失敗:', error);
      
      // より具体的なエラーメッセージを設定
      let errorMessage = error.message;
      
      // よくあるエラーの場合はアドバイスを追加
      if (errorMessage.includes('見つかりませんでした')) {
        errorMessage += ` 代わりに「BTC」「ETH」「ADA」などの一般的なシンボルをお試しください。`;
      } else if (errorMessage.includes('ネットワーク')) {
        errorMessage += ` しばらく待ってから「価格取得をリトライ」ボタンを押してください。`;
      }
      
      setPriceError(errorMessage);
    } finally {
      setIsLoadingPrice(false);
    }
  };

  const retryFetchPrice = async () => {
    console.log('価格取得をリトライします...');
    await fetchPrice();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.symbol && formData.quantity && formData.price) {
      onAddCrypto({
        symbol: formData.symbol.toUpperCase(),
        quantity: parseFloat(formData.quantity),
        price: parseFloat(formData.price)
      });
      setFormData({ symbol: '', quantity: '', price: '' });
      setPriceError('');
      setLastSuccessfulSymbol('');
    }
  };

  const isSuccessMessage = priceError.includes('✅');
  const isNetworkError = priceError.includes('ネットワーク') || priceError.includes('タイムアウト');

  return (
    <div className="crypto-form">
      <h3 className="form-title">
        <span className="emoji">✨</span>
        仮想通貨を追加
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="symbol">
            <span className="emoji">💰</span>
            シンボル
            {lastSuccessfulSymbol && (
              <span className="last-success">
                （最後の成功: {lastSuccessfulSymbol}）
              </span>
            )}
          </label>
          <input
            type="text"
            id="symbol"
            name="symbol"
            value={formData.symbol}
            onChange={handleChange}
            placeholder="BTC, ETH, ADA, DOT..."
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="quantity">
            <span className="emoji">📊</span>
            数量
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="0.001"
            step="any"
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">
            <span className="emoji">💎</span>
            価格 (円)
          </label>
          <div className="price-input-container">
            <div className="price-input-wrapper">
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="価格を入力 または ボタンで取得"
                step="any"
                className="form-input"
                required
              />
            </div>
            <button
              type="button"
              onClick={fetchPrice}
              disabled={!formData.symbol.trim() || isLoadingPrice}
              className="fetch-price-btn"
            >
              {isLoadingPrice ? (
                <>
                  <span className="spinner"></span>
                  取得中...
                </>
              ) : (
                <>
                  <span className="emoji">🔄</span>
                  価格取得
                </>
              )}
            </button>
          </div>
          
          {priceError && (
            <div className={`error-message ${isSuccessMessage ? 'success' : 'error'}`}>
              <span className="emoji">{isSuccessMessage ? '✅' : '⚠️'}</span>
              {priceError}
              {isNetworkError && !isLoadingPrice && (
                <button
                  type="button"
                  onClick={retryFetchPrice}
                  className="retry-btn"
                >
                  <span className="emoji">🔄</span>
                  リトライ
                </button>
              )}
            </div>
          )}
        </div>

        <button type="submit" className="submit-btn">
          <span className="emoji">🚀</span>
          追加する
        </button>
      </form>
    </div>
  );
};

export default CryptoForm; 