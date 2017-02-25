const request = require('superagent')
	, wxApis = require('./wxApis')
	, appId = process.env.XCX_ID
	, appSecret = process.env.XCX_SECRET

function getAccessToken(router) {
	router.use('*', (req, res, next)=> {
		request.get(`${wxApis.token}?grant_type=client_credential&appid=${appId}&secret=${appSecret}`)
		.end((err, result)=> {
			if(err) return console.log(err)
			var accessToken = JSON.parse(result.text).access_token
			req.accessToken = accessToken
			next()
		})
	})
}

module.exports = getAccessToken