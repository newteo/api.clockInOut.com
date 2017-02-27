const router = require('express').Router()
	, fs = require('fs')
	, Company = require('../models/Company')
	, getQRCode = require('../utils/getQRCode')
	, host = require('../utils/hosturl')

getQRCode(router)
router.get('/get', (req, res)=> {

	var resultFlie = req.resultFlie
		, resultBuffer = req.resultBuffer
		// , fileName = JSON.parse(resultFlie[7].substring(21))
		, fileName = Date.now() + 'jpg'
		, filepath = `public/QRcodes/${fileName}`
		, fileStream = fs.createWriteStream(filepath, { 
			flags: 'w', 
			defaultEncoding: 'base64', 
			fd: null, 
			mode: 0o666, 
			autoClose: true 
	})
	fileStream.write(resultBuffer)
	fileStream.end(console.log('success'))
	res.send({QRCodeUrl: host.clock + filepath})
})

module.exports = router