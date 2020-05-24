

# LOGO電商網

- [網站連結](https://final-276802.df.r.appspot.com/)
|(name) | email              | password | 帳戶類別     |
| ------| -------------------| ---------| --------------------|
| John | example@example.com  | 12345678 | 管理員 |
| test | test@test.com  | 12345678 | 使用者 |

- LOGO電商網使用 Node.js + Express + MySQL + Express-handlebars，部署於 google cloud platform，以 RESTFul API 滿足電商網站不同資料的互動需求，大部分商家的客服都已經流程化，但都還是人工服務，因此突發奇想串接 fb messenger 與使用者互動，並可用FB messenger BOT進行退貨，達到節省人力效果。

## Initial - 專案緣起

Alpha Camp 畢業專題，以「電商平台」為主題所打造的作品，其中包含網站開發、金流串接、FB messenger 串接。

專案特點：

1. 網路購物平台提供產品資訊、購物及付費流程。
2. 並可用FB messenger BOT進行退貨。

## Features - 專案功能

- 消費者 CRUD - 商品瀏覽、加入購物車、創建訂單、結帳付款、訂單瀏覽
- 串接第三方藍新金流
- 使用 messaging-api-messenger來串接FB messenger，並實作機器人回復功能
- 採用 bcrypt 處理使用者密碼
- 使用 dotenv 設定環境變數
- 使用 google cloud platform，bucket、cloud storage
- FB messenger BOT展示

<a href="http://www.youtube.com/watch?feature=player_embedded&v=apfYOkF8-6Q
" target="_blank"><img src="http://img.youtube.com/vi/apfYOkF8-6Q/0.jpg" 
alt="圖片 ALT 文字放在這裡" width="360" height="200" border="10" /></a>


## DB Structure - 資料庫架構規劃

- [關聯式資料庫](https://drive.google.com/file/d/14l0dbmis8QK5ZiWyS7K7Axd9MsZIB47Q/view?usp=sharing)


## Environment SetUp - 環境建置

- [Node.js](https://nodejs.org/en/)
- [MySQL](https://www.mysql.com/)
