import React, { useRef, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import './PortfolioChart.css';
import { 
  captureChartAsImage, 
  downloadCanvasAsImage, 
  copyCanvasToClipboard,
  generateShareText,
  generatePrivateShareText
} from '../utils/shareUtils';

ChartJS.register(ArcElement, Tooltip, Legend);

const PortfolioChart = ({ cryptos, totalValue, isPrivacyMode = false }) => {
  const chartRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureError, setCaptureError] = useState('');
  const [isTwitterSharing, setIsTwitterSharing] = useState(false);

  // デバッグ情報
  console.log('PortfolioChart レンダリング:', {
    cryptos: cryptos.length,
    totalValue,
    isPrivacyMode
  });

  // Cute color palette
  const colors = [
    '#FF6B9D', // Pink
    '#C44569', // Dark Pink
    '#F8B500', // Orange
    '#40E0D0', // Turquoise
    '#9B59B6', // Purple
    '#3498DB', // Blue
    '#2ECC71', // Green
    '#E74C3C', // Red
    '#F39C12', // Yellow
    '#1ABC9C', // Teal
    '#E67E22', // Dark Orange
    '#9013FE', // Deep Purple
  ];

  // データが無効な場合の早期リターン
  if (!cryptos || cryptos.length === 0 || totalValue <= 0) {
    return (
      <div className="portfolio-chart">
        <div className="chart-wrapper">
          <div className="empty-chart">
            <span className="emoji big">📊</span>
            <p>チャートを表示するには通貨を追加してください</p>
          </div>
        </div>
      </div>
    );
  }

  // 各通貨のパーセンテージを計算
  const cryptoPercentages = cryptos.map(crypto => {
    const value = crypto.quantity * crypto.price;
    const percentage = totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : 0;
    return {
      ...crypto,
      value,
      percentage: parseFloat(percentage)
    };
  });

  console.log('計算されたパーセンテージ:', cryptoPercentages);

  const data = {
    labels: cryptoPercentages.map(crypto => crypto.symbol),
    datasets: [
      {
        data: cryptoPercentages.map(crypto => crypto.value),
        backgroundColor: colors.slice(0, cryptos.length),
        borderColor: colors.slice(0, cryptos.length).map(color => color),
        borderWidth: 3,
        hoverBorderWidth: 5,
        hoverOffset: 15,
      }
    ]
  };

  console.log('チャートデータ:', {
    labels: data.labels,
    dataValues: data.datasets[0].data,
    datasetLength: data.datasets[0].data.length
  });

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 25,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 13,
            family: "'M PLUS Rounded 1c', sans-serif",
            weight: '600'
          },
          color: '#333',
          generateLabels: function(chart) {
            const datasets = chart.data.datasets;
            if (!datasets || datasets.length === 0) return [];
            
            const dataset = datasets[0];
            if (!dataset || !dataset.data) return [];
            
            // 各データポイントのラベルを生成
            return dataset.data.map((value, index) => {
              const crypto = cryptoPercentages[index];
              if (!crypto) return null;
              
              let labelText;
              if (isPrivacyMode) {
                labelText = `${crypto.symbol} ${crypto.percentage}% (¥****)`;
              } else {
                labelText = `${crypto.symbol} ${crypto.percentage}% (¥${crypto.value.toLocaleString()})`;
              }
              
              return {
                text: labelText,
                fillStyle: dataset.backgroundColor[index],
                strokeStyle: dataset.borderColor ? dataset.borderColor[index] : dataset.backgroundColor[index],
                lineWidth: dataset.borderWidth || 0,
                pointStyle: 'circle',
                hidden: false,
                index: index
              };
            }).filter(label => label !== null);
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: '#FF6B9D',
        borderWidth: 2,
        cornerRadius: 12,
        displayColors: true,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          title: function(context) {
            const crypto = cryptoPercentages[context[0].dataIndex];
            return `${crypto.symbol} (${crypto.percentage}%)`;
          },
          label: function(context) {
            const crypto = cryptoPercentages[context.dataIndex];
            
            if (isPrivacyMode) {
              return [
                `割合: ${crypto.percentage}%`,
                `価値: ¥****`,
                `数量: ***`,
                `価格: ¥****`
              ];
            }
            
            return [
              `割合: ${crypto.percentage}%`,
              `価値: ¥${crypto.value.toLocaleString()}`,
              `数量: ${crypto.quantity}`,
              `価格: ¥${crypto.price.toLocaleString()}`
            ];
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1200,
      easing: 'easeOutQuart'
    },
    onHover: (event, activeElements) => {
      if (event.native && event.native.target) {
        event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
      }
    }
  };

  const handleCopyImage = async () => {
    try {
      setIsCapturing(true);
      setCaptureError('');
      
      const canvas = await captureChartAsImage(chartRef);
      await copyCanvasToClipboard(canvas);
      
      // 成功メッセージ（一時的に表示）
      const message = isPrivacyMode ? 
        '📋 画像をコピーしました（プライバシー保護済み）！' : 
        '📋 画像をクリップボードにコピーしました！';
      setCaptureError(message);
      setTimeout(() => setCaptureError(''), 2000);
      
    } catch (error) {
      setCaptureError('画像のコピーに失敗しました');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleDownloadImage = async () => {
    try {
      setIsCapturing(true);
      setCaptureError('');
      
      const canvas = await captureChartAsImage(chartRef);
      const filename = isPrivacyMode ? 'my-crypto-portfolio-private' : 'my-crypto-portfolio';
      downloadCanvasAsImage(canvas, filename);
      
      const message = isPrivacyMode ? 
        '💾 プライベート画像をダウンロードしました！' : 
        '💾 画像をダウンロードしました！';
      setCaptureError(message);
      setTimeout(() => setCaptureError(''), 2000);
      
    } catch (error) {
      setCaptureError('画像のダウンロードに失敗しました');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleShareToTwitter = async () => {
    try {
      setIsTwitterSharing(true);
      setCaptureError('');
      
      // 画像を先にクリップボードにコピー
      const canvas = await captureChartAsImage(chartRef);
      await copyCanvasToClipboard(canvas);
      
      // テキストのみ生成（URLなし）
      const text = isPrivacyMode ? 
        generatePrivateShareText(cryptos) : 
        generateShareText(cryptos, totalValue);
      
      // テキストのみでTwitterを開く
      const twitterText = text || '';
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`;
      
      window.open(twitterUrl, '_blank');
      
      const message = isPrivacyMode ? 
        '🐦 Twitter画面で画像を貼り付けて投稿してください（画像は既にコピー済み）！' : 
        '🐦 Twitter画面で画像を貼り付けて投稿してください（画像は既にコピー済み）！';
      setCaptureError(message);
      setTimeout(() => setCaptureError(''), 5000); // 5秒間表示
      
    } catch (error) {
      setCaptureError('Twitter共有でエラーが発生しました');
      console.error('Twitter共有エラー:', error);
    } finally {
      setIsTwitterSharing(false);
    }
  };

  return (
    <div className="portfolio-chart">
      <div className="chart-wrapper" ref={chartRef}>
        <Pie data={data} options={options} />
        {isPrivacyMode && (
          <div className="privacy-overlay">
            <span className="privacy-badge">
              <span className="emoji">🔒</span>
              プライバシーモード
            </span>
          </div>
        )}
      </div>
      
      <div className="chart-actions">
        <button
          onClick={handleCopyImage}
          disabled={isCapturing}
          className="chart-action-btn copy-btn"
          title={isPrivacyMode ? "プライベート画像をクリップボードにコピー" : "チャート画像をクリップボードにコピー"}
        >
          {isCapturing ? (
            <>
              <span className="spinner"></span>
              処理中...
            </>
          ) : (
            <>
              <span className="emoji">{isPrivacyMode ? '🔒' : '📋'}</span>
              {isPrivacyMode ? 'プライベート画像コピー' : '画像コピー'}
            </>
          )}
        </button>
        
        <button
          onClick={handleDownloadImage}
          disabled={isCapturing}
          className="chart-action-btn download-btn"
          title={isPrivacyMode ? "プライベート画像をダウンロード" : "チャート画像をダウンロード"}
        >
          <span className="emoji">💾</span>
          {isPrivacyMode ? 'プライベート保存' : '画像保存'}
        </button>
        
        <button
          onClick={handleShareToTwitter}
          disabled={isTwitterSharing}
          className="chart-action-btn twitter-btn"
          title={isPrivacyMode ? "Twitter共有（画像+テキスト、プライバシー保護）" : "Twitter共有（画像+テキスト）"}
        >
          {isTwitterSharing ? (
            <>
              <span className="spinner"></span>
              準備中...
            </>
          ) : (
            <>
              <span className="emoji">{isPrivacyMode ? '🔒' : '🐦'}</span>
              {isPrivacyMode ? 'Twitter共有' : 'Twitter共有'}
            </>
          )}
        </button>
      </div>
      
      {captureError && (
        <div className={`capture-message ${captureError.includes('成功') || captureError.includes('しました') || captureError.includes('完了') ? 'success' : 'error'}`}>
          {captureError}
        </div>
      )}
    </div>
  );
};

export default PortfolioChart; 