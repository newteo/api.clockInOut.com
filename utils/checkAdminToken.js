const jwt = require('jsonwebtoken')
	, ntSalt = process.env.NEWTEO

function checkAdminToken(router) {
	router.use('*', (req, res, next) => {
		var token = req.query.token
		jwt.verify(token, ntSalt, (err, decoded) => {
			if (!err) { 
				next()
			} else res.json(err)
		})
	})
}

module.exports = checkAdminToken