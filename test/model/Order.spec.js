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
const OrderProductModel = require('../../models/order')

describe('# Order Model', () => {
  // before(done => {
  //   done()
  // })

  const Order = OrderProductModel(sequelize, dataTypes)
  const order = new Order()
  checkModelName(Order)('Order')

  context('properties', () => {
    ;[
      'receiver', 'telephone', 'address', 'UserId', 'orderStatus', 'TransportId', 'totalPrice', 'sn', 'payment', 'reason'
    ].forEach(checkPropertyExists(order))
  })

  context('associations', () => {
    const User = 'User'
    const Transport = 'Transport'
    const OrderProduct = 'OrderProduct'

    before(() => {
      Order.associate({ User })
      Order.associate({ Transport })
      Order.associate({ OrderProduct })
    })

    it('should belongs to User', (done) => {
      expect(Order.belongsTo).to.have.been.calledWith(User)
      done()
    })

    it('should belongs to Transport', (done) => {
      expect(Order.belongsTo).to.have.been.calledWith(Transport)
      done()
    })

    it('should have many OrderProduct', (done) => {
      expect(Order.hasMany).to.have.been.calledWith(OrderProduct)
      done()
    })

  })

  context('action', () => {
    let data = null

    it('create', (done) => {
      db.Order.create({}).then((order) => {
        data = order
        done()
      })
    })

    it('read', (done) => {
      db.Order.findByPk(data.id).then((order) => {
        expect(data.id).to.be.equal(order.id)
        done()
      })
    })

    it('update', (done) => {
      db.Order.update({}, { where: { id: data.id } }).then(() => {
        db.Order.findByPk(data.id).then((order) => {
          expect(data.updatedAt).to.be.not.equal(order.updatedAt)
          done()
        })
      })
    })

    it('delete', (done) => {
      db.Order.destroy({ where: { id: data.id } }).then(() => {
        db.Order.findByPk(data.id).then((order) => {
          expect(order).to.be.equal(null)
          done()
        })
      })
    })
  })
})


