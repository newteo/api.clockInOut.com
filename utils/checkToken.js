const jwt = require('jsonwebtoken')
	, salt = process.env.SALT

function checkToken(router) {
	router.use('*', (req, res, next) => {
		var token = req.query.token
		jwt.verify(token, salt, (err, decoded) => {
			if (!err) { 
				req.decoded = decoded
				next()
			} else res.json(err)
		})
	})
}

module.exports = checkToken
