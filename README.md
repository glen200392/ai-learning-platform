# AI學習平台

一個互動式的AI學習平台，提供個性化學習體驗和實戰練習機會。

## 特色功能

- 智慧生活導向的學習路徑
- 個性化學習進度追蹤
- 實戰練習與即時反饋
- AI助手輔助學習

## 部署說明

### GitHub Pages 部署

1. 確保專案已推送到GitHub倉庫
2. 切換到倉庫的Settings > Pages
3. 在Source選項中選擇gh-pages分支
4. 等待部署完成（約1-2分鐘）

### 本地開發

1. 克隆倉庫：
```bash
git clone https://github.com/YOUR-USERNAME/ai-learning-platform.git
cd ai-learning-platform
```

2. 安裝依賴（如果需要）：
```bash
npm install
```

3. 運行開發伺服器：
```bash
python -m http.server 8000
# 或使用其他靜態文件伺服器
```

4. 訪問 `http://localhost:8000`

## 目錄結構

```
ai-learning/
├── assets/          # 靜態資源
├── components/      # 可重用組件
├── css/            # 樣式文件
├── js/
│   ├── core/       # 核心功能
│   └── features/   # 功能模塊
└── index.html      # 主頁面
```

## 更新記錄

### 2025-04-24
- 優化使用者介面，添加生活場景導向的學習內容
- 改進錯誤處理和載入提示
- 添加練習系統
- 更新檔案路徑以支援GitHub Pages

## 注意事項

- 確保瀏覽器允許JavaScript和LocalStorage
- 建議使用最新版本的Chrome、Firefox或Safari
- 部分功能可能需要穩定的網路連接

## 貢獻指南

1. Fork 本專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 創建 Pull Request

## 授權協議

本項目採用 MIT 授權協議 - 查看 [LICENSE](LICENSE) 文件了解詳情
