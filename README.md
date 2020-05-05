

# LOGO電商網

LOGO電商網使用 Node.js + Express + MySQL + Express-handlebars，部署於 Heroku，以 RESTFul API 滿足電商網站不同資料的互動需求，並串接 fb messenger BOT與使用者互動。

## 目錄

- [Initial - 專案緣起](#Initial---)
- [Features - 專案功能](#Features---專案功能)
- [DB Structure - 資料庫架構規劃](#DB-Structure---資料庫架構規劃)
- [Environment SetUp - 環境建置](#Environment-SetUp---環境建置)



## Initial - 專案緣起

Alpha Camp 畢業專題，以「電商平台」為主題所打造的作品，其中包含網站開發、金流串接、FB messenger 串接。

專案特點：

1. 網路購物平台提供一個產品資訊清楚，購物/付費流程簡單，並可用FB messenger BOT進行退貨。

## Features - 專案功能

- 消費者 CRUD - 商品瀏覽、加入購物車、創建訂單、結帳付款、訂單瀏覽
- 串接第三方藍新金流
- 使用 messaging-api-messenger 套件來串接 FB messenger
- 採用 bcrypt 處理使用者密碼
- 使用 dotenv 設定環境變數

## DB Structure - 資料庫架構規劃

- [關聯式資料庫](https://drive.google.com/file/d/14l0dbmis8QK5ZiWyS7K7Axd9MsZIB47Q/view?usp=sharing)


## Environment SetUp - 環境建置

- [Node.js](https://nodejs.org/en/)
- [MySQL](https://www.mysql.com/)