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
const TransportModel = require('../../models/transport')

describe('# Transport Model', () => {
  before(done => {
    done()
  })

  const Transport = TransportModel(sequelize, dataTypes)
  const transport = new Transport()
  checkModelName(Transport)('Transport')

  context('properties', () => {
    ;[
      'name'
    ].forEach(checkPropertyExists(transport))
  })

  context('associations', () => {
    const Order = 'Order'
    before(() => {
      Transport.associate({ Order })
    })

    it('should have many Order', (done) => {
      expect(Transport.hasMany).to.have.been.calledWith(Order)
      done()
    })
  })

  context('action', () => {
    let data = null

    it('create', (done) => {
      db.Transport.create({}).then((transport) => {
        data = transport
        done()
      })
    })

    it('read', (done) => {
      db.Transport.findByPk(data.id).then((transport) => {
        expect(data.id).to.be.equal(transport.id)
        done()
      })
    })

    it('update', (done) => {
      db.Transport.update({}, { where: { id: data.id } }).then(() => {
        db.Transport.findByPk(data.id).then((transport) => {
          expect(data.updatedAt).to.be.not.equal(transport.updatedAt)
          done()
        })
      })
    })

    it('delete', (done) => {
      db.Transport.destroy({ where: { id: data.id } }).then(() => {
        db.Transport.findByPk(data.id).then((transport) => {
          expect(transport).to.be.equal(null)
          done()
        })
      })
    })
  })
})