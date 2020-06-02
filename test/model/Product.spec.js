process.env.NODE_NEV = "test"

var chai = require('chai')
var sinon = require('sinon')
chai.use(require('sinon-chai'))

const { expect } = require('chai')
const {
  sequelize,
  dataTypes,
  checkModelName,
  checkUniqueIndex,
  checkPropertyExists
} = require('sequelize-test-helpers')

const db = require('../../models')
const ProductModel = require('../../models/product')

describe('# Product Model', () => {
  // before(done => {
  //   done()
  // })

  const Product = ProductModel(sequelize, dataTypes)
  const product = new Product()
  checkModelName(Product)('Product')

  context('properties', () => {
    ;[
      'name', 'amount', 'introduction', 'image1', 'image2', 'price', 'cost', 'CatogoryId', 'new', 'popular'
    ].forEach(checkPropertyExists(product))
  })

  context('associations', () => {
    const Catogory = 'Catogory'
    const CartProduct = 'CartProduct'
    const OrderProduct = 'OrderProduct'
    before(() => {
      Product.associate({ Catogory })
      Product.associate({ CartProduct })
      Product.associate({ OrderProduct })
    })

    it('should belongs to Catogory', (done) => {
      expect(Product.belongsTo).to.have.been.calledWith(Catogory)
      done()
    })

    it('should have many CartProducts', (done) => {
      expect(Product.hasMany).to.have.been.calledWith(CartProduct)
      done()
    })
    it('should have many OrderProducts', (done) => {
      expect(Product.hasMany).to.have.been.calledWith(OrderProduct)
      done()
    })
  })

  context('action', () => {
    let data = null

    it('create', (done) => {
      db.Product.create({}).then((product) => {
        data = product
        done()
      })
    })

    it('read', (done) => {
      db.Product.findByPk(data.id).then((product) => {
        expect(data.id).to.be.equal(product.id)
        done()
      })
    })

    it('update', (done) => {
      db.Product.update({}, { where: { id: data.id } }).then(() => {
        db.Product.findByPk(data.id).then((product) => {
          expect(data.updatedAt).to.be.not.equal(product.updatedAt)
          done()
        })
      })
    })

    it('delete', (done) => {
      db.Product.destroy({ where: { id: data.id } }).then(() => {
        db.Product.findByPk(data.id).then((product) => {
          expect(product).to.be.equal(null)
          done()
        })
      })
    })
  })
})


