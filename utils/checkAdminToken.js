const jwt = require('jsonwebtoken')
  , ntSalt = process.env.NEWTEO

function checkAdminToken(router) {
  router.use('*', (req, res, next) => {
    var token = req.query.token
    jwt.verify(token, ntSalt, (err, decoded) => {
      if (!err) { 
        next()
      } else res.status(401).send(err)
    })
  })
}

module.exports = checkAdminToken