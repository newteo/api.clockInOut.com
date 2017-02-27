const request = require('superagent')
	, Company = require('../models/Company')
	, wxApis = require('./wxApis')
	, makeHash = require('./makeHash')
	, getAccessToken = require('./getAccessToken')

function getQRCode(routers) {
	getAccessToken(routers)
	routers.use('*', (req, res, next)=> {
		const accessToken = req.accessToken
			, userId = req.decoded.userId
		Company.findOne({manager: userId})
		.exec((err, company)=> {
			if(err) return res.send({code: 404, err})
			if(!company) return res.send({code: 404, error: 'Not found the company'})
			encrypt = String(company._id)
			console.log(encrypt)
			encrypt = makeHash(encrypt)
			console.log(encrypt)
			request.post(`${wxApis.qrcode}?access_token=${accessToken}`)
			.send({
				path: `pages/login/login?encrypt=${encrypt}`,
				width: 500
			})
			.set('Accept', 'application/json')
			.end((err, result)=> {
				if(err) return res.send({code: 404, err})
				req.resultBuffer = result.body
				req.resultFlie = result.res.rawHeaders
				next()
			})
		})
	})
}

module.exports = getQRCode