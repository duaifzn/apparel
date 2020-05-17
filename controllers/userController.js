const db = require('../models')
const bcrypt = require('bcryptjs')
const Product = db.Product
const Cart = db.Cart
const Catogory = db.Catogory
const CartProduct = db.CartProduct
const Order = db.Order
const OrderProduct = db.OrderProduct
const User = db.User
const Transport = db.Transport
const crypto = require('crypto')

const URL = 'https://final-276802.df.r.appspot.com/'
const MerchantID = process.env.MERCHANT_ID
const HashKey = process.env.HASH_KEY
const HashIV = process.env.HASH_IV
const PayGateWay = "https://ccore.spgateway.com/MPG/mpg_gateway"
const ReturnURL = URL + "/pay/callback?from=ReturnURL"
const NotifyURL = URL + "/admin/pay/callback?from=NotifyURL"
const ClientBackURL = URL + "/checkorder"
const cancelGateWay = "https://ccore.newebpay.com/API/CreditCard/Cancel"

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index]);
  }
}

function genDataChain(TradeInfo) {
  let results = [];
  for (let kv of Object.entries(TradeInfo)) {
    results.push(`${kv[0]}=${kv[1]}`);
  }
  return results.join("&");
}

function create_mpg_aes_encrypt(TradeInfo) {
  let encrypt = crypto.createCipheriv("aes256", HashKey, HashIV);
  let enc = encrypt.update(genDataChain(TradeInfo), "utf8", "hex");
  return enc + encrypt.final("hex");
}

function create_mpg_aes_decrypt(TradeInfo) {
  let decrypt = crypto.createDecipheriv("aes256", HashKey, HashIV);
  decrypt.setAutoPadding(false);
  let text = decrypt.update(TradeInfo, "hex", "utf8");
  let plainText = text + decrypt.final("utf8");
  let result = plainText.replace(/[\x00-\x20]+/g, "");
  return result;
}


function create_mpg_sha_encrypt(TradeInfo) {

  let sha = crypto.createHash("sha256");
  let plainText = `HashKey=${HashKey}&${TradeInfo}&HashIV=${HashIV}`

  return sha.update(plainText).digest("hex").toUpperCase();
}

function getTradeInfo(Amt, Desc, email) {

  console.log('===== getTradeInfo =====')
  console.log(Amt, Desc, email)
  console.log('==========')

  data = {
    'MerchantID': MerchantID, // 商店代號
    'RespondType': 'JSON', // 回傳格式
    'TimeStamp': Date.now(), // 時間戳記
    'Version': 1.5, // 串接程式版本
    'MerchantOrderNo': Date.now(), // 商店訂單編號
    'LoginType': 0, // 智付通會員
    'OrderComment': 'OrderComment', // 商店備註
    'Amt': Amt, // 訂單金額
    'ItemDesc': Desc, // 產品名稱
    'Email': email, // 付款人電子信箱
    'ReturnURL': ReturnURL, // 支付完成返回商店網址
    'NotifyURL': NotifyURL, // 支付通知網址/每期授權結果通知
    'ClientBackURL': ClientBackURL, // 支付取消返回商店網址
  }

  console.log('===== getTradeInfo: data =====')
  console.log(data)


  mpg_aes_encrypt = create_mpg_aes_encrypt(data)
  mpg_sha_encrypt = create_mpg_sha_encrypt(mpg_aes_encrypt)

  console.log('===== getTradeInfo: mpg_aes_encrypt, mpg_sha_encrypt =====')
  console.log(mpg_aes_encrypt)
  console.log(mpg_sha_encrypt)

  tradeInfo = {
    'MerchantID': MerchantID, // 商店代號
    'TradeInfo': mpg_aes_encrypt, // 加密後參數
    'TradeSha': mpg_sha_encrypt,
    'Version': 1.5, // 串接程式版本
    'PayGateWay': PayGateWay,
    'MerchantOrderNo': data.MerchantOrderNo,
  }

  console.log('===== getTradeInfo: tradeInfo =====')
  console.log(tradeInfo)

  return tradeInfo
}

function getCancelTradeInfo(Amt, sn) {

  console.log('===== getCancelTradeInfo =====')
  console.log(Amt, sn)
  console.log('==========')

  data = {
    'RespondType': 'JSON', // 回傳格式
    'Version': 1.0, // 串接程式版本
    'Amt': Amt, // 訂單金額
    'MerchantOrderNo': sn, // 商店訂單編號
    'IndexType': 1,
    'TimeStamp': Date.now(), // 時間戳記
  }

  console.log('===== getCancelTradeInfo: data =====')
  console.log(data)


  cancel_aes_encrypt = create_mpg_aes_encrypt(data)
  //mpg_sha_encrypt = create_mpg_sha_encrypt(mpg_aes_encrypt)

  console.log('===== getCancelTradeInfo: cancel_aes_encrypt=====')
  console.log(cancel_aes_encrypt)
  //console.log(mpg_sha_encrypt)

  cancelTradeInfo = {
    'MerchantID_': MerchantID, // 商店代號
    'PostData_': cancel_aes_encrypt, // 加密後參數
    //'TradeSha': mpg_sha_encrypt,
    //'Version': 1.0, // 串接程式版本
    'cancelGateWay': cancelGateWay,
    //'MerchantOrderNo': data.MerchantOrderNo,
  }

  console.log('===== getCancelTradeInfo: cancelTradeInfo =====')
  console.log(cancelTradeInfo)

  return cancelTradeInfo
}

const userController = {
  signInPage: (req, res) => {
    return res.render('signInPage')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '登入成功')
    return res.redirect('/')
  },

  signUpPage: (req, res) => {
    return res.render('signUpPage')
  },

  signUp: (req, res) => {
    if (req.body.password !== req.body.password2) {
      req.flash('error_messages', '密碼輸入不相同')
      return res.redirect('back')
    }
    User.findOne({ where: { email: req.body.email } }).then(user => {
      if (user) {
        req.flash('error_messages', '帳號已註冊')
        return res.redirect('back')
      } else {
        User.create({
          name: req.body.name,
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password, 10),
          address: req.body.address,
          telephone: req.body.telephone,
          role: 'user'
        }).then(user => {
          req.flash('success_messages', '成功註冊')
          return res.redirect('/signin')
        })
      }
    })
  },

  logOut: (req, res) => {
    req.flash('success_messages', '登出成功')
    req.logout()
    res.redirect('/')
  },
  itemsPage: (req, res) => {
    Product.findAll().then(products => {
      products = products.map(product => ({
        ...product.dataValues,
        introduction: product.dataValues.introduction.substring(0, 20) + '...'
      }))
      res.render('itemsPage', JSON.parse(JSON.stringify({ products: products })))
    })
  },
  catogoryitems: (req, res) => {
    Product.findAll({ where: { CatogoryId: req.params.catogory_id } }).then(products => {
      Catogory.findByPk(req.params.catogory_id)
        .then(catogory => {
          return res.render('itemsPage', JSON.parse(JSON.stringify({ products: products, catogory: catogory })))
        })
    })
  },
  itemPage: (req, res) => {
    Product.findByPk(req.params.item_id, { include: Catogory })
      .then(product => {
        //console.log(product)
        res.render('itemPage', JSON.parse(JSON.stringify({ product: product, catogory: product.Catogory })))
      })
  },
  cartPage: (req, res) => {
    CartProduct.findAll({ where: { UserId: req.user.id }, include: Product })
      .then(cartProducts => {
        let totalPrice = 0
        cartProducts.forEach(cartProduct => {
          totalPrice += cartProduct.price
        })
        res.render('cartPage', JSON.parse(JSON.stringify({ cartProducts: cartProducts, totalPrice: totalPrice })))
      })
  },
  addCart: (req, res) => {
    //console.log(req.body)
    //redisClient.hmset(req.user.id, [req.body.productId, req.body.amount,])
    CartProduct.findOrCreate({
      where: { UserId: req.user.id, ProductId: req.body.productId },
      defaults: {
        amount: req.body.amount,
        price: Number(req.body.productPrice) * Number(req.body.amount)
      }
    }).spread(function (cartProduct, created) {
      if (!created) {
        cartProduct.update({
          amount: Number(cartProduct.amount) + Number(req.body.amount),
          price: Number(cartProduct.price) + Number(req.body.productPrice) * Number(req.body.amount)
        })
      }
    }).then(() => {
      return res.redirect('back')
    })
  },
  deleteCart: (req, res) => {
    CartProduct.destroy({
      where: {
        UserId: req.user.id,
        ProductId: req.params.item_id
      }
    }).then(() => {
      res.redirect('back')
    })
  },
  addCartProduct: (req, res) => {
    CartProduct.findOne({ where: { UserId: req.user.id, ProductId: req.params.item_id }, include: Product }).then(cartProduct => {
      cartProduct.update({
        amount: cartProduct.amount + 1,
        price: cartProduct.price + cartProduct.Product.price
      })
        .then((CartProduct) => {
          return res.redirect('back')
        })
    })
  },
  subCartProduct: (req, res) => {
    CartProduct.findOne({ where: { UserId: req.user.id, productId: req.params.item_id }, include: Product }).then(cartProduct => {
      cartProduct.update({
        amount: cartProduct.amount - 1 >= 1 ? cartProduct.amount - 1 : 1,
        price: cartProduct.price - cartProduct.Product.price >= cartProduct.Product.price ? cartProduct.price - cartProduct.Product.price : cartProduct.Product.price
      })
        .then((cartProduct) => {
          return res.redirect('back')
        })
    })
  },
  order: (req, res) => {
    CartProduct.findAll({ where: { UserId: req.user.id }, include: Product })
      .then(cartProducts => {
        let totalPrice = 0
        cartProducts.forEach(cartProduct => {
          totalPrice += cartProduct.price
        })
        res.render('order', JSON.parse(JSON.stringify({ cartProducts: cartProducts, totalPrice: totalPrice })))
      })

  },
  checkOrder: (req, res) => {
    let total = 0
    CartProduct.findAll({ where: { UserId: req.user.id } })
      .then(async cartProducts => {
        for await (let cartProduct of cartProducts) {
          total += cartProduct.price
        }
      }).then(() => {
        Order.create({
          receiver: req.body.receiver,
          telephone: req.body.receiver_telephone,
          address: req.body.receiver_address,
          UserId: req.user.id,
          orderStatus: '未付款',
          payment: '未付款',
          TransportId: req.body.transport,
          totalPrice: total
        }).then((order) => {
          CartProduct.findAll({ where: { UserId: req.user.id } })
            .then(cartProducts => {
              asyncForEach(cartProducts, async cartProduct => {
                await OrderProduct.create({
                  OrderId: order.id,
                  ProductId: cartProduct.ProductId,
                  amount: cartProduct.amount,
                  price: cartProduct.price
                }).catch(err => {
                  console.error(err)
                }).then(() => {
                  cartProduct.destroy()
                })
              }).then(() => {
                Order.findAll({
                  where: { UserId: req.user.id },
                  limit: 1,
                  order: [['updatedAt', 'DESC']],
                  include: [Transport]
                }).then((order) => {

                  const tradeInfo = getTradeInfo(order[0].totalPrice, 'LOGO產品', req.user.email)
                  //console.log(tradeInfo.MerchantOrderNo)
                  order[0].update({
                    sn: tradeInfo.MerchantOrderNo,
                  }).then((o) => {

                    return res.render('checkOrder', JSON.parse(JSON.stringify({ order: o, tradeInfo: tradeInfo })))
                  })

                })
              })

            })
        }).catch(function (err) {
          console.error(err)
        });
      })


  },
  getOrder: (req, res) => {
    Order.findAll({
      where: { UserId: req.user.id },
      limit: 1,
      order: [['updatedAt', 'DESC']],
      include: [Transport]
    }).then((order) => {
      //console.log(order)
      const tradeInfo = getTradeInfo(order[0].totalPrice, 'LOGO產品', req.user.email)
      return res.render('checkOrder', JSON.parse(JSON.stringify({ order: order[0], tradeInfo: tradeInfo })))
    })
  },
  getAOrder: (req, res) => {
    Order.findOne({ where: { id: req.params.order_id, UserId: req.user.id } })
      .then((order) => {
        if (order && order.orderStatus === '未付款') {
          const tradeInfo = getTradeInfo(order.totalPrice, 'LOGO產品', req.user.email)
          order.update({
            sn: tradeInfo.MerchantOrderNo
          }).then(o => {
            return res.render('checkOrder', JSON.parse(JSON.stringify({ order: o, tradeInfo: tradeInfo })))
          })
        }
        else if (order && order.orderStatus === '已取消訂單') {
          let cancel = true
          return res.render('checkOrder', JSON.parse(JSON.stringify({ order: order, cancel: cancel })))
        }
        else if (order) {
          return res.render('checkOrder', JSON.parse(JSON.stringify({ order: order })))
        }
        else {
          return res.redirect('back')
        }
      })
  },
  pay: (req, res) => {
    console.log(req.method)
    console.log(req.query)
    console.log(req.body)
    let info = JSON.parse(create_mpg_aes_decrypt(req.body.TradeInfo))
    console.log(info)

    Order.findOne({ where: { sn: info.Result.MerchantOrderNo }, include: [Transport] })
      .then(order => {
        if (info.Status === 'SUCCESS') {
          order.update({
            orderStatus: '已付款',
            payment: info.Result.PaymentType
          }).then((o) => {
            res.render('paydone', JSON.parse(JSON.stringify({ order: o, orderStatus: true })))
          })
        }
        else {
          res.render('paydone', JSON.parse(JSON.stringify({ order: order, orderStatus: false })))
        }
      })


  },
  adminPay: (req, res) => {
    return
  },
  cancelOrder: (req, res) => {
    Order.findOne({ where: { id: req.params.order_id } })
      .then(order => {
        if (order.orderStatus === "未付款") {
          order.update({
            orderStatus: "已取消訂單"
          }).then(o => {
            let cancel = true
            res.render('checkOrder', JSON.parse(JSON.stringify({ order: o, cancel: cancel })))
          })
        }
        else {
          const cancelTradeInfo = getCancelTradeInfo(order.totalPrice, order.sn)
          res.render('checkOrder', JSON.parse(JSON.stringify({ order: order, cancelTradeInfo: cancelTradeInfo })))
        }

      })

  }

}

module.exports = userController