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
  }

}
