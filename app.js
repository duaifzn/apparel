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
// const { MessengerClient } = require('messaging-api-messenger');
// const client = MessengerClient.connect({
//   accessToken: process.env.ACCESS_TOKEN,
//   appId: process.env.APP_ID,
//   appSecret: process.env.APP_SECRET,
//   version: '6.0',
// });


app.engine('handlebars', exphbs({ defaultLayout: 'main', helpers: require('./config/handlebars-helper') }))
app.set('view engine', 'handlebars')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(methodOverride('_method'))
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}
))



app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use((req, res, next) => {
  res.locals.user = req.user
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  next()
})

require('./routes')(app, passport)

app.listen(port, () => {
  console.log(`Enter http://localhost:${port}/ if you run this app on your local computer.`)
})

module.exports = app 