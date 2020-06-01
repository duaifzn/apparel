const express = require('express')
const db = require('./models') // 引入資料庫
const bodyParser = require('body-parser')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const session = require('express-session')
const flash = require('connect-flash')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()

}

const passport = require('./config/passport')
const app = express()
const port = process.env.PORT || 3000

app.engine('handlebars', exphbs({ defaultLayout: 'main', helpers: require('./config/handlebars-helper') }))
app.set('view engine', 'handlebars')

const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');

// This is your API key that you retrieve from www.mailgun.com/cp (free up to 10K monthly emails)
const auth = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN
  }
}


const nodemailerMailgun = nodemailer.createTransport(mg(auth));


// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
// //     user: process.env.MAILER_USER,
//     pass: process.env.MAILER_PASSWORD
//   }
// });



app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(methodOverride('_method'))
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}
))


app.use('/upload', express.static(__dirname + '/upload'))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use((req, res, next) => {
  res.locals.user = req.user
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  next()
})




require('./routes')(app, passport, nodemailerMailgun)

app.listen(port, () => {
  //db:migrate
  //db.sequelize.sync()
  console
  console.log(`Enter http://localhost:${port}/ if you run this app on your local computer.`)
})

module.exports = app 