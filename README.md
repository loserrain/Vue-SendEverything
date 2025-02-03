# SendEveryThing - 即時資訊分享

## 專案簡介
SendEveryThing 是一款基於 Vue.js + Spring Boot 的即時資訊分享平台，提供匿名檔案上傳下載、即時聊天室、多人檔案管理與端對端加密等功能，確保資訊安全與隱私，此為Vue.js的前端專案。    
🔹 匿名檔案分享：無須註冊即可上傳與下載檔案。  
🔹 即時聊天室：支援 AES-GCM 加密，確保訊息安全。  
🔹 多人檔案管理：註冊用戶可管理與分享檔案。  
🔹 安全驗證：採用 JWT、Spring Security、OAuth 2.0 (Google) 進行身份驗證。  

## 技術架構

### 前端 (Vue 3)
🔹 Vue 3 Composition API + Pinia (狀態管理)  
🔹 Vite (開發環境)  
🔹 Web Worker (提高性能)  

### 後端 (Spring Boot)
🔹 Spring Boot 3 + Spring Security  
🔹 WebSocket (即時聊天)  
🔹 JWT / OAuth 2.0 (身份驗證)  

### 資料庫
🔹 MongoDB / MySQL (資料儲存)  
🔹 IPFS (分散式檔案儲存)  

### DevOps & 部署
🔹 Nginx (反向代理)  
🔹 Docker (DB 部署)  
🔹 GitHub (版本控制)  

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/)

## 

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

```sh
http://localhost:8081
```

### Compile and Minify

```sh
npm run build
```

```sh
services/Unify_API/API_URL.js
```
