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
const CartProductModel = require('../../models/cartproduct')

describe('# CartProduct Model', () => {
  // before(done => {
  //   done()
  // })

  const CartProduct = CartProductModel(sequelize, dataTypes)
  const cartProduct = new CartProduct()
  checkModelName(CartProduct)('CartProduct')

  context('properties', () => {
    ;[
      'UserId', 'ProductId', 'amount', 'price'
    ].forEach(checkPropertyExists(cartProduct))
  })

  context('associations', () => {
    const User = 'User'
    const Product = 'Product'
    before(() => {
      CartProduct.associate({ User })
      CartProduct.associate({ Product })
    })

    it('should belongs to User', (done) => {
      expect(CartProduct.belongsTo).to.have.been.calledWith(User)
      done()
    })

    it('should belongs to Product', (done) => {
      expect(CartProduct.belongsTo).to.have.been.calledWith(Product)
      done()
    })

  })

  context('action', () => {
    let data = null

    it('create', (done) => {
      db.CartProduct.create({}).then((cartProduct) => {
        data = cartProduct
        done()
      })
    })

    it('read', (done) => {
      db.CartProduct.findByPk(data.id).then((cartProduct) => {
        expect(data.id).to.be.equal(cartProduct.id)
        done()
      })
    })

    it('update', (done) => {
      db.CartProduct.update({}, { where: { id: data.id } }).then(() => {
        db.CartProduct.findByPk(data.id).then((cartProduct) => {
          expect(data.updatedAt).to.be.not.equal(cartProduct.updatedAt)
          done()
        })
      })
    })

    it('delete', (done) => {
      db.CartProduct.destroy({ where: { id: data.id } }).then(() => {
        db.CartProduct.findByPk(data.id).then((cartProduct) => {
          expect(cartProduct).to.be.equal(null)
          done()
        })
      })
    })
  })
})


