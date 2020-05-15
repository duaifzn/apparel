const dotenv = require('dotenv')
dotenv.config()
module.exports = {
  development: {
    username: "root",
    password: "password",
    database: "final",
    host: "127.0.0.1",
    dialect: "mysql"
  },
  test: {
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "mysql"
  },
  production: {
    username: process.env.USER_NAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    dialect: "postgres",
    host: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
    timestamps: false,
    dialectOptions: {
      socketPath: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`
    }
  }
}