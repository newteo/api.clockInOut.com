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
			if(err) return res.status(404).send(err)
			if(!company) return res.status(404).send({error: 'Not found the company'})
			var encrypt = String(company._id)
			request.post(`${wxApis.qrcode}?access_token=${accessToken}`)
			.send({
				path: `pages/scan/scan?encrypt=${encrypt}`,
				width: 500
			})
			.set('Accept', 'application/json')
			.end((err, result)=> {
				if(err) return res.status(404).send(err)
				req.resultBuffer = result.body
				req.resultFlie = result.res.rawHeaders
				next()
			})
		})
	})
}

module.exports = getQRCode