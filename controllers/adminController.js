const db = require('../models')
const bcrypt = require('bcryptjs')
const axios = require('axios')
const blue = require('./blue')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const Product = db.Product
const Cart = db.Cart
const Catogory = db.Catogory
const CartProduct = db.CartProduct
const Order = db.Order
const OrderProduct = db.OrderProduct
const User = db.User
const Transport = db.Transport



const adminController = {
  itemsPage: (req, res) => {
    Product.findAll().then(products => {
      res.render('admin/adminItemsPage', JSON.parse(JSON.stringify({ products: products })))
    })
  },
  createItemPage: (req, res) => {
    Catogory.findAll()
      .then(catogories => {
        res.render('admin/createItemPage', JSON.parse(JSON.stringify({ catogories: catogories })))
      })

  },
  createItem: (req, res) => {
    const { files } = req
    console.log('req.body', req.body)
    Product.create({
      name: req.body.name,
      amount: Number(req.body.amount),
      CatogoryId: req.body.catogory,
      introduction: req.body.introduction,
      price: Number(req.body.price),
      cost: Number(req.body.cost),
      new: req.body.new ? true : false,
      popular: req.body.popular ? true : false,
    }).then(p => {
      if (files) {
        imgur.setClientID(IMGUR_CLIENT_ID)
        if (files['image1']) {
          imgur.upload(files['image1'][0].path, (err, img) => {
            Product.update({ image1: img.data.link }, { where: { id: p.id } })
          })
        }
        if (files['image2']) {
          imgur.upload(files['image2'][0].path, (err, img) => {
            Product.update({ image2: img.data.link }, { where: { id: p.id } })
          })
        }
        res.redirect(`/admin/items/${p.id}`)
      }
      else {
        res.redirect(`/admin/items/${p.id}`)
      }

    })
  },
  itemDetailPage: (req, res) => {
    Product.findOne({ where: { id: req.params.item_id }, include: Catogory })
      .then(product => {
        res.render('admin/adminItemPage', JSON.parse(JSON.stringify({ product: product })))
      })
  },
  editItemPage: (req, res) => {
    Product.findOne({ where: { id: req.params.item_id }, include: Catogory })
      .then(product => {
        Catogory.findAll().then(catogories => {
          res.render('admin/editItemPage', JSON.parse(JSON.stringify({ product: product, catogories: catogories })))
        })

      })
  },
  editItem: (req, res) => {
    const { files } = req
    Product.update({
      name: req.body.name,
      amount: Number(req.body.amount),
      CatogoryId: req.body.catogory,
      introduction: req.body.introduction,
      price: Number(req.body.price),
      cost: Number(req.body.cost),
      new: req.body.new ? true : false,
      popular: req.body.popular ? true : false,
    }, { where: { id: req.params.item_id } })
      .then(p => {

        if (files) {
          imgur.setClientID(IMGUR_CLIENT_ID)
          if (files['image1']) {
            imgur.upload(files['image1'][0].path, (err, img) => {
              Product.update({ image1: img.data.link }, { where: { id: req.params.item_id } })
            })
          }
          if (files['image2']) {
            imgur.upload(files['image2'][0].path, (err, img) => {
              Product.update({ image2: img.data.link }, { where: { id: req.params.item_id } })
            })
          }
          res.redirect(`/admin/items/${req.params.item_id}`)
        }
        else {
          res.redirect(`/admin/items/${req.params.item_id}`)
        }

      })

  },
  deleteItem: (req, res) => {
    Product.destroy({ where: { id: req.params.item_id } })
      .then(() => {
        res.redirect('back')
      })
  },
  orderPage: (req, res) => {
    Order.findAll().then(orders => {
      res.render("admin/orderPage", JSON.parse(JSON.stringify({ orders: orders })))
    })
  },
  orderDetail: (req, res) => {
    Order.findOne({ where: { id: req.params.order_id }, include: User })
      .then(order => {
        let applyCancel = false
        if (order.orderStatus === '取消訂單申請中') { applyCancel = true }
        res.render('admin/adminOrder', JSON.parse(JSON.stringify({ USER: order.User, order: order, applyCancel: applyCancel })))
      })
  },
  catogoryPage: (req, res) => {
    Catogory.findAll().then(catogories => {
      res.render('admin/catogoryPage', JSON.parse(JSON.stringify({ catogories: catogories })))
    })
  },
  createCatogory: (req, res) => {
    Catogory.create({
      name: req.body.catogory
    }).catch(err => {
      console.error(err)
    }).then(() => {
      res.redirect('back')
    })
  },
  deleteCatogory: (req, res) => {
    Catogory.destroy({ where: { id: req.params.catogory_id } })
      .then(() => {
        res.redirect('back')
      })
  },
  cancelOrder: (req, res) => {
    Order.findOne({ where: { id: req.params.order_id } })
      .then(order => {
        const cancelTradeInfo = blue.getCancelTradeInfo(order.totalPrice, order.sn)
        const params = new URLSearchParams();
        params.append('MerchantID_', cancelTradeInfo.MerchantID);
        params.append('PostData_', cancelTradeInfo.PostData);
        axios.post(cancelTradeInfo.cancelGateWay, params)
          .then((response) => {
            if (response.data.Status === "SUCCESS") {
              order.update({
                orderStatus: "已取消訂單"
              }).then(o => {
                res.render('admin/adminOrder', JSON.parse(JSON.stringify({ order: o, cancel: true })))
              })
            }
            else {
              res.render('admin/adminOrder', JSON.parse(JSON.stringify({ order: order, cancel: true })))
            }
          })



      })

  },
  refuseCancelOrder: (req, res) => {
    Order.update({
      orderStatus: "原因不符合規定，無法取消訂單"
    }, { where: { id: req.params.order_id } })
      .then(() => {
        res.redirect('back')
      })
  }
}
module.exports = adminController