const userController = require('../controllers/userController')
const adminController = require('../controllers/adminController')
// const access_token = process.env.ACCESS_TOKEN
// const verify_token = process.env.VERIFY_TOKEN
// const app_id = process.env.APP_ID
// const app_secret = process.env.APP_SECRET

let data = []
module.exports = (app, passport, client) => {

  const authenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next()
    }
    res.redirect('/signin')
  }
  const authenticatedAdmin = (req, res, next) => {
    if (req.isAuthenticated()) {
      if (req.user.role === 'admin') { return next() }
      return res.redirect('/')
    }
    res.redirect('/signin')
  }
  // 登入頁面
  app.get('/signin', userController.signInPage)
  // 登入
  app.post('/signin', passport.authenticate('local', {
    failureRedirect: '/signin',
    failureFlash: true
  }), userController.signIn)
  // 註冊頁面
  app.get('/signup', userController.signUpPage)
  // 註冊
  app.post('/signup', userController.signUp)
  // 登出
  app.get('/logout', userController.logOut)
  //
  app.get('/', (req, res) => {
    res.redirect('/items')
  })
  //看見站內所有商品(設為前台首頁)
  app.get('/items', userController.itemsPage)
  //瀏覽分類的商品
  app.get('/catogories/:catogory_id', userController.catogoryitems)
  //瀏覽單項商品
  app.get('/items/:item_id', userController.itemPage)
  //瀏覽購物車
  app.get('/cart', authenticated, userController.cartPage)
  //商品加入購物車
  app.post('/cart', authenticated, userController.addCart)
  //商品從購物車移除
  app.get('/cart/delete/:item_id', authenticated, userController.deleteCart)
  app.get('/cart/add/:item_id', authenticated, userController.addCartProduct)
  app.get('/cart/reduce/:item_id', authenticated, userController.subCartProduct)
  //結帳頁面，填寫顧客及配送資訊
  app.get('/order', authenticated, userController.order)
  //將購買資訊寫入訂單資料庫，顯示訂單資訊成功刪除購物車內容
  app.post('/checkorder', authenticated, userController.checkOrder)
  app.get('/checkorder', authenticated, userController.getOrder)
  //查看訂單
  //app.get('/checkorder/:order_id', authenticated, userController.lookOrder)
  //藍金callback
  app.post('/pay/callback', authenticated, userController.pay)
  app.get('/admin/pay/callback', authenticated, userController.adminPay)

  app.get('/done', authenticatedAdmin, (req, res) => {
    data = []
    res.redirect('back')
  })
  // Accepts POST requests at /webhook endpoint
  app.post('/webhook', (req, res) => {
    console.log('app.post /webhook')
    console.log(req.body)
    const event = req.body.entry[0].messaging[0];
    //console.log(req.body.entry[0].messaging)
    const userId = event.sender.id; // 傳話給你的使用者 id
    if (event.message) {
      const text = event.message.text; // 使用者講的話
      if (!data.includes(userId)) {
        switch (text) {
          case '產品問題':
            client.sendText(userId, '問題種類?', {
              quick_replies: [
                {
                  content_type: 'text',
                  title: '產品有瑕疵',
                  payload: 'DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_RED',
                },
                {
                  content_type: 'text',
                  title: '使用上問題',
                  payload: 'DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_RED',
                },
                {
                  content_type: 'text',
                  title: '其他問題',
                  payload: 'DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_RED',
                },
              ],
            });
            break;
          case '產品有瑕疵':
            client.sendText(userId, '將會有專人為您服務');
            if (data.length > 50) data = []
            data.push(userId);
            break;
          case '使用上問題':
            client.sendText(userId, '將會有專人為您服務');
            if (data.length > 50) data = []
            data.push(userId);
            break;
          case '其他問題':
            client.sendText(userId, '將會有專人為您服務');
            if (data.length > 50) data = []
            data.push(userId);
            break;
          case '如何購買':
            client.sendText(userId, '申請會員，進入網站下單購買');
            if (data.length > 50) data = []
            data.push(userId);
            break;
          default:
            client.sendText(userId, '需要幫忙嗎?', {
              quick_replies: [
                {
                  content_type: 'text',
                  title: '產品問題',
                  payload: 'DEVELOPER_DEFINED_PAYLOAD_FOR_PRODUCTION_PROBLEM',
                },
                {
                  content_type: 'text',
                  title: '如何購買',
                  payload: 'DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_RED',
                },
                {
                  content_type: 'text',
                  title: '其他問題',
                  payload: 'DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_RED',
                },
              ],
            });
            break;
        }
      }
    }
    if (event.referral) {
      console.log('event.referral: ', event.referral)
      client.sendMessage(userId, {
        text: '帥哥美女好!!為您推薦熱銷商品',
      });
      client.sendGenericTemplate(
        userId,
        [
          {
            title: "True麵",
            image_url: 'https://i.imgur.com/qNlOYjl.png',
            subtitle: "巷口小吃裡，最令人懷念的熟悉滋味，甜辣口...",
            default_action: {
              type: 'web_url',
              url: 'https://fecd3db3.ngrok.io',
              messenger_extensions: true,
              webview_height_ratio: 'tall',
              fallback_url: 'https://fecd3db3.ngrok.io/items/1',
            },
            buttons: [
              {
                type: 'postback',
                title: '獲取折扣碼',
                payload: 'DEVELOPER_DEFINED_PAYLOAD',
              },
            ],
          },
          {
            title: "男士商務襯衫",
            image_url: 'https://i.imgur.com/GXZW9Ly.png',
            subtitle: "流線型剪裁，簡單俐落，採用富有彈性的科技...",
            default_action: {
              type: 'web_url',
              url: 'https://fecd3db3.ngrok.io',
              messenger_extensions: true,
              webview_height_ratio: 'tall',
              fallback_url: 'https://fecd3db3.ngrok.io/items/2',
            },
            buttons: [
              {
                type: 'postback',
                title: '獲取折扣碼',
                payload: 'DEVELOPER_DEFINED_PAYLOAD',
              },
            ],
          },
          {
            title: "涼感衣 (V領Skull)",
            image_url: 'https://i.imgur.com/kTCoKDr.png',
            subtitle: "惡名昭彰的全新《IcedLite™ 冰涼...",
            default_action: {
              type: 'web_url',
              url: 'https://fecd3db3.ngrok.io',
              messenger_extensions: true,
              webview_height_ratio: 'tall',
              fallback_url: 'https://fecd3db3.ngrok.io/items/3',
            },
            buttons: [
              {
                type: 'postback',
                title: '獲取折扣碼',
                payload: 'DEVELOPER_DEFINED_PAYLOAD',
              },
            ],
          },
        ],
        { image_aspect_ratio: 'square' }
      );
    }



    res.sendStatus(200);
  });

  // Accepts GET requests at the /webhook endpoint
  app.get('/webhook', (req, res) => {
    /** UPDATE YOUR VERIFY TOKEN **/
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

    //console.log("VERIFY_TOKEN", VERIFY_TOKEN)
    //console.log("req.query: ", req.query)
    //console.log("req.query['hub.mode']: ", req.query['hub.mode'])
    //console.log("req.query['hub.verify_token']: ", req.query['hub.verify_token'])
    //console.log("req.query['hub.challenge']: ", req.query['hub.challenge'])
    // Parse params from the webhook verification request

    if (
      req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === process.env.VERIFY_TOKEN
    ) {
      res.send(req.query['hub.challenge']);
    } else {
      console.error('Failed validation. Make sure the validation tokens match.');
      res.sendStatus(403);
    }

  });

  // //轉跳至 /admin/items
  // app.get('/admin', authenticated, (req, res) => {
  //   res.redirect('/admin/items')
  // })
  // //看見站內所有商品(設為後台首頁)
  // app.get('/admin/items', authenticated, adminController.itemsPage)
  // //新增商品頁面
  // app.get('/admin/items/create', authenticated, adminController.createItemPage)
  // //新增商品
  // app.post('/admin/items/create', authenticated, adminController.createItem)
  // //單項商品詳細頁面
  // app.get('/admin/items/:item_id', authenticated, adminController.itemDetailPage)
  // //編輯單項商品頁面
  // app.get('/admin/items/:item_id/edit', authenticated, adminController.editItemPage)
  // //編輯單項商品
  // app.post('/admin/items/:item_id/edit', authenticated, adminController.editItem)
  // //刪除單項商品
  // app.delete('/admin/items/:item_id/delete', authenticated, adminController.deleteItem)
  // //看見站內所有訂單
  // app.get('/admin/orders', authenticated, adminController.orderPage)
  // //更改訂單狀態
  // app.post('/admin/orders/:order_id', authenticated, adminController.editOrder)
  // //查看訂單詳細資訊頁面
  // app.get('/admin/orders/:order_id', authenticated, adminController.orderDetail)
  // //查看所有類別
  // app.get('/admin/catogories', authenticated, adminController.catogoryPage)
  // //新增類別
  // app.post('/admin/catogories', authenticated, adminController.createCatogory)
  // //刪除類別
  // app.delete('/admin/catogories/:catogory_id', authenticated, adminController.deleteCatogory)
  // //銷售報表頁面
  // app.get('/admin/sales', authenticated, adminController.salePage)
  // //計算銷售報表
  // app.post('/admin/sales', authenticated, adminController.calculateSale)
  // //查看所有會員頁面
  // app.get('/admin/members', authenticated, adminController.memberPage)
  // //新增管理員
  // app.post('/admin/members', authenticated, adminController.createAdmin)
  // //編輯會員權限
  // app.post('/admin/members/:user_id', authenticated, adminController.aditUser)
}