const users = require('./users')
const auth = require('./auth')
const profile = require('./profile')

module.exports = (app) => {
  app.use('/auth', auth)
  app.use('/users', users)
  app.use('/profile', profile)
}