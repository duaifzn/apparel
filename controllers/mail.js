const db = require('../models')
const Product = db.Product
const OrderProduct = db.OrderProduct


module.exports = {
  sentMail: (transporter) => {
    return function (req, res) {

      OrderProduct.findAll({ where: { id: req.ORDER.orderId }, include: Product })
        .then(orderProducts => {
          res.render('mail/mail', JSON.parse(JSON.stringify({
            layout: null, order: req.ORDER, orderProducts: orderProducts, notice: req.ORDER.notice
          })), (err, html) => {
            if (err) {
              console.log('error in email template');
            }
            let mailOptions = {
              from: 'logo@sandboxa932dece180c4d2b92bc6a6c0c717280.mailgun.org',
              to: req.ORDER.client.email,
              subject: req.ORDER.notice + '通知',
              html: html
            };
            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
              }
            });
          })
        })


    }



  }
}

