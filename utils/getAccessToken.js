const request = require('superagent')
	, wxApis = require('./wxApis')
	, checkToken = require('./checkToken')
	, appId = process.env.XCX_ID
	, appSecret = process.env.XCX_SECRET

function getAccessToken(router) {
	checkToken(router)
	router.use('*', (req, res, next)=> {
		request.get(`${wxApis.token}?grant_type=client_credential&appid=${appId}&secret=${appSecret}`)
		.end((err, result)=> {
			if(err) return res.send({code: 404, err})
			var accessToken = JSON.parse(result.text).access_token
			req.accessToken = accessToken
			req.decoded = req.decoded
			next()
		})
	})
}

module.exports = getAccessToken