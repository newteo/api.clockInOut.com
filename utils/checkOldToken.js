const jwt = require('jsonwebtoken')

function checkOldToken(router) {
	router.use('*', (req, res, next) => {
		var token = req.query.token
		jwt.verify(token, 'newteo.com', (err, decoded) => {
			if (!err) { 
				req.decoded = decoded
				next()
			} else res.json(err)
		})
	})
}

module.exports = checkOldToken