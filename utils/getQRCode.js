const request = require('superagent')
	, wxApis = require('./wxApis')
	, getAccessToken = require('./getAccessToken')

function getQRCode(routers) {
	getAccessToken(routers)
	routers.use('*', (req, res, next)=> {
		const accessToken = req.accessToken
			, path = req.body.path
			, width = req.body.width
		request.post(`${wxApis.qrcode}?access_token=${accessToken}`)
		.send({
			path: path,
			width: width
		})
		.set('Accept', 'application/json')
		.end((err, result)=> {
			if(err) return console.log(err)
			req.resultBuffer = result.body
			req.resultFlie = result.res.rawHeaders
			next()
		})
	})
}

module.exports = getQRCode