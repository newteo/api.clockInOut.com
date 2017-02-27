const router = require('express').Router()
	, Company = require('../models/Company')
	, User = require('../models/User')
	, upload = require('../utils/upload')
	, host = require('../utils/hosturl')
	, checkToken = require('../utils/checkToken')

checkToken(router)

router.post('/new', (req, res)=> {
	const userId = req.decoded.userId
	const company = new Company({
		name: req.body.name || null,
		logo: null,
		address: req.body.address || null,
		coordinate_latitude: req.body.latitude || null,
		coordinate_longitude: req.body.longitude || null,
		phone: req.body.phone || null,
		commutingTime: req.body.commutingTime || [ ],
		radius: req.body.radius || 100,
		corporateMember: [ ],
		mottos: [ ],
		QRcodeUrl: null,
		remark: null
	})
	company.save((err)=> {
		if(err) return res.send({code: 404, err})
		User.update({_id: userId}, 
		{$set: {
			types: 'manager',
			belongsTo: company._id
		}}, 
		{upsert: true}, 
		(err, txt)=> {
			if(err) return console.log(err)
			// console.log('user changed')
		})
		res.send({code: 200, company})
	})
})
//
router.post('/logo', (req, res)=> {
	const userId = req.decoded.userId
	const logoUpload = upload('logos', 'logo')
	User.findOne({_id: userId})
	.exec((err, user)=> {
		if(err) return res.send({code: 404, err})
		if(!user) return res.send({code: 404, error: 'Please to make sure for your information whether is deleted'})
		if(user.types == 'manager') return res.send({code: 404, error: 'You are not the manager'})
		logoUpload(req, res, (err)=> {
			if(err) return res.send({code: 404, error: 'Something wrong or no key'})
			Company.findOneAndUpdate({_id: user.belongsTo}, 
			{$set: {logo: host.clock + req.file.path}}, 
			{new: true}, 
			(err, company)=> {
				if(err) return res.send({code: 404, err})
				re.send({code: 200, company})
			})
		})
	})
})

module.exports = router