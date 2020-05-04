const { MessengerClient } = require('messaging-api-messenger');
const client = MessengerClient.connect({
  accessToken: process.env.ACCESS_TOKEN,
  appId: process.env.APP_ID,
  appSecret: process.env.APP_SECRET,
  version: '6.0',
});
var moment = require('moment');
const db = require('../models')
const Product = db.Product
const Cart = db.Cart
const Catogory = db.Catogory
const CartProduct = db.CartProduct
const Order = db.Order
const OrderProduct = db.OrderProduct
const User = db.User
const Transport = db.Transport
let URL = 'https://hidden-cliffs-50028.herokuapp.com/'
let waitUser = []
let ReturnUser = []
let newProduct = []
let popularProduct = []
Product.findAll({ where: { new: true } }).then(products => {
  asyncForEach(products, (product) => {
    let reply = {
      title: product.name,
      image_url: product.image1,
      subtitle: product.introduction.substring(0, 20) + '...',
      default_action: {
        type: 'web_url',
        url: `${URL}/items/${product.id}`,
        messenger_extensions: true,
        webview_height_ratio: 'tall',
        fallback_url: `${URL}/items/${product.id}`,
      }
    }
    newProduct.push(reply)
  })
})

Product.findAll({ where: { popular: true } }).then(products => {
  asyncForEach(products, (product) => {
    let reply = {
      title: product.name,
      image_url: product.image1,
      subtitle: product.introduction.substring(0, 20) + '...',
      default_action: {
        type: 'web_url',
        url: `${URL}/items/${product.id}`,
        messenger_extensions: true,
        webview_height_ratio: 'tall',
        fallback_url: `${URL}/items/${product.id}`,
      },

    }
    popularProduct.push(reply)
  })
})

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

const messengerController = {
  postWebhook: (req, res) => {
    console.log('app.post /webhook')
    client.setGetStarted('GET_STARTED')
    client.setPersistentMenu([
      {
        locale: 'default',
        call_to_actions: [
          {
            title: 'Play Again',
            type: 'postback',
            payload: 'RESTART',
          },
          {
            title: 'Language Setting',
            type: 'nested',
            call_to_actions: [
              {
                title: '中文',
                type: 'postback',
                payload: 'CHINESE',
              },
              {
                title: 'English',
                type: 'postback',
                payload: 'ENGLISH',
              },
            ],
          },
          {
            title: 'Explore D',
            type: 'nested',
            call_to_actions: [
              {
                title: 'Explore',
                type: 'web_url',
                url: 'https://www.youtube.com/watch?v=v',
                webview_height_ratio: 'tall',
              },
              {
                title: 'W',
                type: 'web_url',
                url: 'https://www.facebook.com/w',
                webview_height_ratio: 'tall',
              },
              {
                title: 'Powered by YOCTOL',
                type: 'web_url',
                url: 'https://www.yoctol.com/',
                webview_height_ratio: 'tall',
              },
            ],
          },
        ],
      },
    ]);
    console.log(req.body)
    const event = req.body.entry[0].messaging[0];
    //console.log(req.body.entry[0].messaging)
    const userId = event.sender.id; // 傳話給你的使用者 id
    console.log('@@@@@', event)
    if (event.message && !waitUser.includes(userId)) {
      const text = event.message.text; // 使用者講的話
      if (ReturnUser[userId]) {
        switch (ReturnUser[userId].status) {
          case 1:
            if (isNaN(Number(text))) {
              delete ReturnUser[userId]
              client.sendText(userId, '查無此訂單');
              break;
            }
            Order.findOne({ where: { id: Number(text) } })
              .then((order) => {
                //如果時間大於七天顯示已過七天鑑賞期無法退貨
                //end_date.diff(start_date, 'days')
                let time = 0
                if (order) {
                  time = moment().diff(order.updatedAt, 'days')
                }


                if (time > 7 && order) {

                  delete ReturnUser[userId]
                  client.sendText(userId, '很抱歉，已過七天鑑賞期無法退貨');
                }
                else if (order && order.orderStatus === '未付款') {
                  delete ReturnUser[userId]
                  client.sendText(userId, '很抱歉，您的訂單未付款，無法退貨');
                }
                else if (order && order.orderStatus === '退貨申請中') {
                  delete ReturnUser[userId]
                  client.sendText(userId, '您的訂單退貨申請中');
                }
                else if (order && order.orderStatus === '退貨中') {
                  delete ReturnUser[userId]
                  client.sendText(userId, '您的訂單退貨中，並進行退款。請備妥發票，將會派人到府收件')

                }
                else if (order && order.orderStatus === '已退貨') {
                  delete ReturnUser[userId]
                  client.sendText(userId, '您的訂單已退貨完成');
                }
                else if (time < 7 && order && order.orderStatus === '已付款') {
                  ReturnUser[userId].status = 2
                  ReturnUser[userId].order = order.id
                  ReturnUser[userId].orderUserId = order.UserId
                  client.sendText(userId, '請輸入姓名:');
                }
                else {
                  delete ReturnUser[userId]
                  client.sendText(userId, '查無此訂單');
                }
              })
            break;
          case 2:
            User.findOne({ where: { id: ReturnUser[userId].orderUserId, name: text } })
              .then((user) => {
                if (user) {
                  ReturnUser[userId].name = text
                  ReturnUser[userId].status = 3
                  client.sendText(userId, '請輸入電話:')
                }
                else {
                  delete ReturnUser[userId]
                  client.sendText(userId, '姓名與訂單不符');
                }
              })
            break;
          case 3:
            User.findOne({ where: { id: ReturnUser[userId].orderUserId, name: ReturnUser[userId].name, telephone: text } })
              .then((user) => {
                if (user) {
                  Order.update({ orderStatus: '退貨中' }, { where: { id: ReturnUser[userId].order } })
                    .then(() => {
                      delete ReturnUser[userId]
                      client.sendText(userId, '您的訂單退貨申請中');
                    })
                }
                else {
                  delete ReturnUser[userId]
                  client.sendText(userId, '電話與姓名不符');
                }
              })
            break;
        }


      }
      else {
        switch (text) {
          case '熱銷產品':
            client.sendGenericTemplate(userId, popularProduct, { image_aspect_ratio: 'square' })
              .then(() => {
                client.sendText(userId, '需要任何幫助嗎?', {
                  quick_replies: [
                    {
                      content_type: 'text',
                      title: '熱銷產品',
                      payload: 'DEVELOPER_DEFINED_PAYLOAD_FOR_PRODUCTION_PROBLEM',
                    },
                    {
                      content_type: 'text',
                      title: '退貨',
                      payload: 'DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_RED',
                    },
                    {
                      content_type: 'text',
                      title: '其他問題',
                      payload: 'DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_RED',
                    },
                  ],
                });
              })
            break;
          case '退貨':
            let data = {
              status: 1,
              order: '',
              orderUserId: '',
              name: '',
              phone: ''
            }
            ReturnUser[userId] = data
            console.log(ReturnUser)
            client.sendText(userId, '請輸入訂單編號為您退貨');
            break;
          case '其他問題':
            if (waitUser.length > 50) waitUser = []
            waitUser.push(userId);
            client.sendText(userId, '將會有專人為您服務，輸入"BOT"開啟機器人服務');
            break;
          default:
            client.sendText(userId, '需要任何幫助嗎?', {
              quick_replies: [
                {
                  content_type: 'text',
                  title: '熱銷產品',
                  payload: 'DEVELOPER_DEFINED_PAYLOAD_FOR_PRODUCTION_PROBLEM',
                },
                {
                  content_type: 'text',
                  title: '退貨',
                  payload: 'DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_RED',
                },
                {
                  content_type: 'text',
                  title: '其他問題',
                  payload: 'DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_RED',
                },
              ],
            });
            break;
        }
      }
    }
    if (event.referral && !waitUser.includes(userId)) {
      console.log('event.referral: ', event.referral)
      client.sendMessage(userId, { text: '帥哥美女好!!為您推薦新商品' })
      client.sendGenericTemplate(userId, newProduct, { image_aspect_ratio: 'square' })

    }
    if (waitUser.includes(userId)) {

      if (event.message) {
        if (event.message.text === 'BOT') {
          waitUser.splice(waitUser.indexOf(userId), 1)
          client.sendText(userId, '需要任何幫助嗎?', {
            quick_replies: [
              {
                content_type: 'text',
                title: '熱銷產品',
                payload: 'DEVELOPER_DEFINED_PAYLOAD_FOR_PRODUCTION_PROBLEM',
              },
              {
                content_type: 'text',
                title: '退貨',
                payload: 'DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_RED',
              },
              {
                content_type: 'text',
                title: '其他問題',
                payload: 'DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_RED',
              },
            ],
          });
        }
      }
    }

    res.sendStatus(200);
  },
  getWebhook: (req, res) => {
    /** UPDATE YOUR VERIFY TOKEN **/
    //const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
    //console.log("VERIFY_TOKEN", VERIFY_TOKEN)
    //console.log("req.query: ", req.query)
    //console.log("req.query['hub.mode']: ", req.query['hub.mode'])
    //console.log("req.query['hub.verify_token']: ", req.query['hub.verify_token'])
    //console.log("req.query['hub.challenge']: ", req.query['hub.challenge'])
    // Parse params from the webhook verification request

    if (
      req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === process.env.VERIFY_TOKEN
    ) {
      res.send(req.query['hub.challenge']);
    } else {
      console.error('Failed validation. Make sure the validation tokens match.');
      res.sendStatus(403);
    }
  }
}

module.exports = messengerController