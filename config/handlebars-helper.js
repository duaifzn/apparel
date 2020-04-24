const moment = require('moment')

module.exports = {
  ifRole: function (role, options) {
    if (role === 'admin') {
      return options.fn(this)
    } else {
      return options.inverse(this)
    }
  },
  moment: function (a) {
    return moment(a).fromNow()
  },
  // // ifCond: function (a, options) {
  // //   if (a === '已付款') {
  // //     return options.fn(this)
  // //   } else {
  // //     return options.inverse(this)
  // //   }
  // // }
  ifCond: function (a, b, options) {
    if (a === b) {
      return options.fn(this)
    } else {
      return options.inverse(this)
    }
  }

}
