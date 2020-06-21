const db = require('../models')
const bcrypt = require('bcryptjs')
const helper = require('../helper')
const Product = db.Product
const Cart = db.Cart
const Catogory = db.Catogory
const CartProduct = db.CartProduct
const Order = db.Order
const OrderProduct = db.OrderProduct
const User = db.User
const Transport = db.Transport
const crypto = require('crypto')
const axios = require('axios')
const blue = require('./blue')

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
        res.render('itemPage', JSON.parse(JSON.stringify({ product: product, catogory: product.Catogory })))
      })
  },
  cartPage: (req, res) => {
    CartProduct.findAll({ where: { UserId: helper.getUser(req).id }, include: Product })
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
    //redisClient.hmset(helper.getUser(req).id, [req.body.productId, req.body.amount,])
    CartProduct.findOrCreate({
      where: { UserId: helper.getUser(req).id, ProductId: req.body.productId },
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
        UserId: helper.getUser(req).id,
        ProductId: req.params.item_id
      }
    }).then(() => {
      res.redirect('back')
    })
  },
  addCartProduct: (req, res) => {
    CartProduct.findOne({ where: { UserId: helper.getUser(req).id, ProductId: req.params.item_id }, include: Product }).then(cartProduct => {
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
    CartProduct.findOne({ where: { UserId: helper.getUser(req).id, productId: req.params.item_id }, include: Product }).then(cartProduct => {
      cartProduct.update({
        amount: cartProduct.amount - 1 >= 1 ? cartProduct.amount - 1 : 1,
        price: cartProduct.price - cartProduct.Product.price >= cartProduct.Product.price ? cartProduct.price - cartProduct.Product.price : cartProduct.Product.price
      }).then((cartProduct) => {
        return res.redirect('back')
      })
    })
  },
  order: (req, res) => {
    CartProduct.findAll({ where: { UserId: helper.getUser(req).id }, include: Product })
      .then(async cartProducts => {
        let totalPrice = 0
        for await (let cartProduct of cartProducts) {
          totalPrice += cartProduct.price
        }
        res.render('order', JSON.parse(JSON.stringify({ cartProducts: cartProducts, totalPrice: totalPrice })))
      })

  },
  checkOrder: (req, res, next) => {
    let total = 0
    CartProduct.findAll({ where: { UserId: helper.getUser(req).id } })
      .then(async cartProducts => {
        for await (let cartProduct of cartProducts) {
          total += cartProduct.price
        }
      }).then(() => {
        Order.create({
          receiver: req.body.receiver,
          telephone: req.body.receiver_telephone,
          address: req.body.receiver_address,
          UserId: helper.getUser(req).id,
          orderStatus: '未付款',
          payment: '未付款',
          TransportId: req.body.transport,
          totalPrice: total
        }).then((order) => {
          CartProduct.findAll({ where: { UserId: helper.getUser(req).id } })
            .then(cartProducts => {
              blue.asyncForEach(cartProducts, async cartProduct => {
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
                  where: { UserId: helper.getUser(req).id },
                  limit: 1,
                  order: [['updatedAt', 'DESC']],
                  include: [Transport]
                }).then((order) => {

                  const tradeInfo = blue.getTradeInfo(order[0].totalPrice, 'LOGO產品', helper.getUser(req).email)
                  //console.log(tradeInfo.MerchantOrderNo)
                  order[0].update({
                    sn: tradeInfo.MerchantOrderNo,
                  }).then((o) => {
                    req.ORDER = {
                      client: helper.getUser(req),
                      totalPrice: o.totalPrice,
                      orderStatus: o.orderStatus,
                      payment: o.payment,
                      orderId: o.id,
                      notice: "訂單成立"
                    }
                    next()
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
      where: { UserId: helper.getUser(req).id },
      limit: 1,
      order: [['updatedAt', 'DESC']],
      include: [Transport]
    }).then((order) => {
      //console.log(order)
      const tradeInfo = blue.getTradeInfo(order[0].totalPrice, 'LOGO產品', helper.getUser(req).email)
      return res.render('checkOrder', JSON.parse(JSON.stringify({ order: order[0], tradeInfo: tradeInfo })))
    })
  },
  getAOrder: (req, res) => {
    Order.findOne({ where: { id: req.params.order_id, UserId: helper.getUser(req).id } })
      .then((order) => {
        if (order && order.orderStatus === '未付款') {
          const tradeInfo = blue.getTradeInfo(order.totalPrice, 'LOGO產品', helper.getUser(req).email)
          order.update({
            sn: tradeInfo.MerchantOrderNo
          }).then(o => {
            return res.render('checkOrder', JSON.parse(JSON.stringify({ order: o, tradeInfo: tradeInfo })))
          })
        }
        else if (order && (order.orderStatus === '已取消訂單' || order.orderStatus === '取消訂單申請中' || order.orderStatus === '原因不符合規定，無法取消訂單')) {
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
  pay: (req, res, next) => {
    console.log(req.method)
    console.log(req.query)
    console.log(req.body)
    let info = JSON.parse(blue.create_mpg_aes_decrypt(req.body.TradeInfo))
    console.log(info)

    Order.findOne({ where: { sn: info.Result.MerchantOrderNo }, include: [Transport] })
      .then(order => {
        if (info.Status === 'SUCCESS') {
          order.update({
            orderStatus: '已付款',
            payment: info.Result.PaymentType
          }).then((o) => {
            req.ORDER = {
              client: helper.getUser(req),
              totalPrice: o.totalPrice,
              orderStatus: o.orderStatus,
              payment: o.payment,
              orderId: o.id,
              notice: '付款成功'
            }
            next()
            res.render('paydone', JSON.parse(JSON.stringify({ order: o, orderStatus: true })))
            return
          })
        }
        else {
          req.ORDER = {
            client: helper.getUser(req),
            totalPrice: order.totalPrice,
            orderStatus: order.orderStatus,
            payment: order.payment,
            orderId: order.id,
            notice: '付款失敗'
          }
          next()
          res.render('paydone', JSON.parse(JSON.stringify({ order: order, orderStatus: false })))
          return
        }
      })


  },
  adminPay: (req, res) => {
    return
  },
  cancelOrder: (req, res, next) => {
    Order.findOne({ where: { id: req.params.order_id } })
      .then(order => {
        if (order.orderStatus === "未付款") {
          order.update({
            orderStatus: "已取消訂單"
          }).then(o => {
            req.ORDER = {
              client: helper.getUser(req),
              totalPrice: o.totalPrice,
              orderStatus: o.orderStatus,
              payment: o.payment,
              orderId: o.id,
              notice: "已取消訂單"
            }
            next()
            res.render('checkOrder', JSON.parse(JSON.stringify({ order: o, cancel: true })))
            return
          })
        }
        else {
          res.render('checkOrder', JSON.parse(JSON.stringify({ order: order, cancelCheck: true })))
        }

      })

  },
  cancelOrderCheck: (req, res, next) => {
    Order.findOne({ where: { id: req.params.order_id } })
      .then(order => {
        order.update({
          reason: req.body.reason,
          orderStatus: "取消訂單申請中"
        }).then(o => {
          req.ORDER = {
            client: helper.getUser(req),
            totalPrice: o.totalPrice,
            orderStatus: o.orderStatus,
            payment: o.payment,
            orderId: o.id,
            notice: "取消訂單申請中"
          }
          next()
          res.render('checkOrder', JSON.parse(JSON.stringify({ order: o, cancel: true })))
          return
        })
      })

  }
}

module.exports = userController