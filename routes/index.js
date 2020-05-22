const userController = require('../controllers/userController')
const adminController = require('../controllers/adminController')
const messengerController = require('../controllers/messengerController')
const multer = require('multer')
// const multerGoogleStorage = require("multer-google-storage");
// const uploadHandler = multer({
//   storage: multerGoogleStorage.storageEngine()
// });
//const upload = multer({ dest: 'upload/' })


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
  //查看訂單
  app.get('/checkorder/:order_id', authenticated, userController.getAOrder)
  //取消訂單
  app.get('/cancelorder/:order_id', authenticated, userController.cancelOrder)
  app.post('/cancelorder/check/:order_id', authenticated, userController.cancelOrderCheck)
  //藍金callback
  app.post('/pay/callback', authenticated, userController.pay)

  // Accepts POST requests at /webhook endpoint
  app.post('/webhook', messengerController.postWebhook)
  // Accepts GET requests at the /webhook endpoint
  app.get('/webhook', messengerController.getWebhook)


  app.get('/admin/pay/callback', authenticatedAdmin, userController.adminPay)
  //轉跳至 /admin/items
  app.get('/admin', authenticatedAdmin, (req, res) => {
    res.redirect('/admin/items')
  })
  //看見站內所有商品(設為後台首頁)
  app.get('/admin/items', authenticatedAdmin, adminController.itemsPage)
  //新增商品頁面
  app.get('/admin/items/create', authenticatedAdmin, adminController.createItemPage)
  //新增商品
  app.post('/admin/items/create', authenticatedAdmin, adminController.createItem)
  //app.post('/admin/items/create', authenticatedAdmin, uploadHandler.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }]), adminController.createItem)
  //單項商品詳細頁面
  app.get('/admin/items/:item_id', authenticatedAdmin, adminController.itemDetailPage)
  //編輯單項商品頁面
  app.get('/admin/items/:item_id/edit', authenticatedAdmin, adminController.editItemPage)
  //編輯單項商品
  app.post('/admin/items/:item_id/edit', authenticatedAdmin, adminController.editItem)
  //app.post('/admin/items/:item_id/edit', authenticatedAdmin, uploadHandler.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }]), adminController.editItem)
  //刪除單項商品
  app.delete('/admin/items/:item_id', authenticatedAdmin, adminController.deleteItem)
  //看見站內所有訂單
  app.get('/admin/orders', authenticatedAdmin, adminController.orderPage)
  //確認取消訂單
  app.get('/admin/orders/cancel/:order_id', authenticatedAdmin, adminController.cancelOrder)
  //拒絕取消訂單
  app.get('/admin/orders/refuse/:order_id', authenticatedAdmin, adminController.refuseCancelOrder)
  //查看訂單詳細資訊頁面
  app.get('/admin/orders/:order_id', authenticatedAdmin, adminController.orderDetail)
  //查看所有類別
  app.get('/admin/catogories', authenticatedAdmin, adminController.catogoryPage)
  //新增類別
  app.post('/admin/catogories', authenticatedAdmin, adminController.createCatogory)
  //刪除類別
  app.delete('/admin/catogories/:catogory_id', authenticatedAdmin, adminController.deleteCatogory)
  app.get('*', (req, res) => {
    res.redirect('/')
  })
}