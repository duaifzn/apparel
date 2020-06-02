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
const CatogoryModel = require('../../models/catogory')

describe('# Catogory Model', () => {
  // before(done => {
  //   done()
  // })

  const Catogory = CatogoryModel(sequelize, dataTypes)
  const catogory = new Catogory()
  checkModelName(Catogory)('Catogory')

  context('properties', () => {
    ;[
      'name'
    ].forEach(checkPropertyExists(catogory))
  })

  context('associations', () => {
    const Product = 'Product'
    before(() => {
      Catogory.associate({ Product })
    })

    it('should have many Products', (done) => {
      expect(Catogory.hasMany).to.have.been.calledWith(Product)
      done()
    })

  })

  context('action', () => {
    let data = null

    it('create', (done) => {
      db.Catogory.create({}).then((catogory) => {
        data = catogory
        done()
      })
    })

    it('read', (done) => {
      db.Catogory.findByPk(data.id).then((catogory) => {
        expect(data.id).to.be.equal(catogory.id)
        done()
      })
    })

    it('update', (done) => {
      db.Catogory.update({}, { where: { id: data.id } }).then(() => {
        db.Catogory.findByPk(data.id).then((catogory) => {
          expect(data.updatedAt).to.be.not.equal(catogory.updatedAt)
          done()
        })
      })
    })

    it('delete', (done) => {
      db.Catogory.destroy({ where: { id: data.id } }).then(() => {
        db.Catogory.findByPk(data.id).then((catogory) => {
          expect(catogory).to.be.equal(null)
          done()
        })
      })
    })
  })
})


