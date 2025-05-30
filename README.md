# 🌈 Crypto Portfolio 💎

かわいい仮想通貨ポートフォリオ管理アプリです！

## ✨ 機能

- 🪙 仮想通貨の手動入力（シンボル、数量、価格）
- 📊 美しい円グラフでのポートフォリオ表示
- 💰 合計価値の自動計算
- 🗑️ 簡単な削除機能
- 💾 ローカルストレージによるデータ保存
- 📱 レスポンシブデザイン

## 🚀 セットアップ

### 必要なもの
- Node.js (v14以上)
- npm または yarn

### インストール

```bash
# 依存関係をインストール
npm install

# 開発サーバーを起動
npm start
```

## 📦 GitHub Pagesへのデプロイ

1. GitHubリポジトリを作成
2. `package.json`の`homepage`フィールドを更新:
   ```json
   "homepage": "https://YOUR_USERNAME.github.io/crypto-portfolio"
   ```
3. デプロイコマンドを実行:
   ```bash
   npm run deploy
   ```

## 🎨 カスタマイズ

### 色の変更
`src/components/PortfolioChart.js`の`colors`配列を編集して、チャートの色をカスタマイズできます。

### 通貨の追加
フォームから以下の情報を入力:
- シンボル (例: BTC, ETH)
- 数量 (例: 0.5)
- 価格 (円単位, 例: 1000000)

## 🛠️ 技術スタック

- React 18
- Chart.js & react-chartjs-2
- CSS3 (カスタムスタイル)
- LocalStorage API

## 📱 レスポンシブ対応

- デスクトップ
- タブレット
- スマートフォン

---

Made with 💖 by You! 