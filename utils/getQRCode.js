const request = require('superagent')
	, wxApis = require('./wxApis')
	, getAccessToken = require('./getAccessToken')

function getQRCode(routers) {
	getAccessToken(routers)
	routers.use('*', (req, res, next)=> {
		const accessToken = req.accessToken
		request.post(`${wxApis.qrcode}?access_token=${accessToken}`)
		.send({
			path: 'newteo',
			width: 580
		})
		.set('Accept', 'application/json')
		.end((err, result)=> {
			if(err) return console.log(err)
			req.result = result
			next()
		})
	})
}

module.exports = getQRCode