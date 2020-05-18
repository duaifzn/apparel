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

const adminController = {
  itemsPage: (req, res) => {
    Product.findAll().then(products => {
      res.render('admin/adminItemsPage', JSON.parse(JSON.stringify({ products: products })))
    })
  },
  itemDetailPage: (req, res) => {
    Product.findOne({ where: { id: req.params.item_id } })
      .then(product => {
        res.render('admin/adminItemPage', JSON.parse(JSON.stringify({ product: product })))
      })
  },

}
module.exports = adminController