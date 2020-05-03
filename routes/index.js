const userController = require('../controllers/userController')
const adminController = require('../controllers/adminController')
const messengerController = require('../controllers/messengerController')
// const access_token = process.env.ACCESS_TOKEN
// const verify_token = process.env.VERIFY_TOKEN
// const app_id = process.env.APP_ID
// const app_secret = process.env.APP_SECRET

module.exports = (app, passport) => {

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
  app.get('/checkorder/:order_id', authenticated, userController.getAOrder)
  //查看訂單
  //app.get('/checkorder/:order_id', authenticated, userController.lookOrder)
  //藍金callback
  app.post('/pay/callback', authenticated, userController.pay)
  app.get('/admin/pay/callback', authenticated, userController.adminPay)

  app.get('/done', authenticatedAdmin, (req, res) => {
    //data = []
    res.redirect('back')
  })
  // Accepts POST requests at /webhook endpoint
  app.post('/webhook', messengerController.postWebhook)
  // Accepts GET requests at the /webhook endpoint
  app.get('/webhook', messengerController.getWebhook)

  app.get('*', (req, res) => {
    res.redirect('/')
  })
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