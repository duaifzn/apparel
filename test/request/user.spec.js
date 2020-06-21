process.env.NODE_ENV = 'test'

var chai = require('chai')
var request = require('supertest')
var sinon = require('sinon')
var app = require('../../app')
var helper = require('../../helper');
var should = chai.should()
const db = require('../../models')

describe('# user request', () => {

  context('# item', () => {
    before(async () => {
      this.ensureAuthenticated = sinon.stub(helper, ensureAuthenticated).returns(true)

      this.getUser = sinon.stub(helper, 'getUser').returns({ id: 1 })
    })

    describe('go to items page', () =>{
      it('will show items Page', (done) =>{
        request(app)
        .get('/items')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) =>{
          if(err) return done(err)
          
        })
      })
    })
  })

  context('# cart', () => {

  })

  context('# order', () => {

  })



})