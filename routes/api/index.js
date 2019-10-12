const users = require('./users')
const auth = require('./auth')
const profile = require('./profile')
const posts = require('./posts')

module.exports = (app) => {
  app.use('/auth', auth)
  app.use('/users', users)
  app.use('/profile', profile)
  app.use('/posts', posts)
}