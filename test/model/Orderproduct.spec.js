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
const OrderProductModel = require('../../models/orderproduct')

describe('# OrderProduct Model', () => {
  // before(done => {
  //   done()
  // })

  const OrderProduct = OrderProductModel(sequelize, dataTypes)
  const orderProduct = new OrderProduct()
  checkModelName(OrderProduct)('OrderProduct')

  context('properties', () => {
    ;[
      'OrderId', 'ProductId', 'amount', 'price'
    ].forEach(checkPropertyExists(orderProduct))
  })

  context('associations', () => {
    const Order = 'Order'
    const Product = 'Product'
    before(() => {
      OrderProduct.associate({ Order })
      OrderProduct.associate({ Product })
    })

    it('should belongs to Order', (done) => {
      expect(OrderProduct.belongsTo).to.have.been.calledWith(Order)
      done()
    })

    it('should belongs to Product', (done) => {
      expect(OrderProduct.belongsTo).to.have.been.calledWith(Product)
      done()
    })

  })

  context('action', () => {
    let data = null

    it('create', (done) => {
      db.OrderProduct.create({}).then((orderProduct) => {
        data = orderProduct
        done()
      })
    })

    it('read', (done) => {
      db.OrderProduct.findByPk(data.id).then((orderProduct) => {
        expect(data.id).to.be.equal(orderProduct.id)
        done()
      })
    })

    it('update', (done) => {
      db.OrderProduct.update({}, { where: { id: data.id } }).then(() => {
        db.OrderProduct.findByPk(data.id).then((orderProduct) => {
          expect(data.updatedAt).to.be.not.equal(orderProduct.updatedAt)
          done()
        })
      })
    })

    it('delete', (done) => {
      db.OrderProduct.destroy({ where: { id: data.id } }).then(() => {
        db.OrderProduct.findByPk(data.id).then((orderProduct) => {
          expect(orderProduct).to.be.equal(null)
          done()
        })
      })
    })
  })
})


