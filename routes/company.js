const router = require('express').Router()
	, Company = require('../models/Company')
	, upload = require('../utils/upload')
	, host = require('../utils/hosturl')

router.post('/new', (req, res)=> {
	const company = new Company({
		name: req.body.name,
		logo: req.body.logo || null,
		address: req.body.address,
		coordinate_latitude: req.body.coordinate_latitude,
		coordinate_longitude: req.body.coordinate_longitude,
		phone: req.body.phone,
		commutingTime: req.body.commutingTime,
		radius: req.body.radius,
		corporateMember: [ ],
		mottos: req.body.mottos,
		QRcodeUrl: req.body.QRcodeUrl,
		remark: req.body.remark
	})
	company.save((err)=> {
		if(err) return res.send({code: 200, company})
	})
})

module.exports = router