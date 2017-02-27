const router = require('express').Router()
	, Company = require('../models/Company')
	, User = require('../models/User')
	, upload = require('../utils/upload')
	, delFile = require('../utils/delFile')
	, host = require('../utils/hosturl')
	, checkToken = require('../utils/checkToken')

checkToken(router)

function createCompany(uId, body, path, res) {
	const company = new Company({
		manager: uId,
		name: body.name || null,
		logo: path || null,
		address: body.address || null,
		coordinate_latitude: body.latitude || null,
		coordinate_longitude: body.longitude || null,
		phone: body.phone || null,
		commutingTime: body.commutingTime || [ ],
		radius: body.radius || 100,
		corporateMember: [ ],
		mottos: [ ],
		QRcodeUrl: null,
		remark: null
	})
	company.save((err)=> {
		if(err) return res.send({code: 404, err})
		User.update({_id: uId}, 
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
}
//创建公司信息
router.post('/new', (req, res)=> {
	const userId = req.decoded.userId
	const logoUpload = upload('logos', 'logo')
	Company.findOne({manager: userId})
	.exec((err, exist)=> {
		if(err) return res.send({code: 404, err})
		if(exist) return res.send({code: 403, error: 'You had created one company'})
		logoUpload(req, res, (err)=> {
			if(err) return res.send({code: 404, err})
			var filepath = host.clock + req.file.path
			createCompany(userId, req.body, filepath, res)
		})
	})
})
//更改logo
router.post('/logo', (req, res)=> {
	const userId = req.decoded.userId
	const logoUpload = upload('logos', 'logo')
	User.findOne({_id: userId})
	.exec((err, user)=> {
		if(err) return res.send({code: 404, err})
		if(!user) return res.send({code: 404, error: 'Please to make sure for your information whether is deleted'})
		if(user.types != 'manager') return res.send({code: 404, error: 'You are not the manager'})
		logoUpload(req, res, (err)=> {
			if(err) return res.send({code: 404, err})
			Company.findOne({_id: user.belongsTo})
			.exec((err, company)=> {
				if(err) return res.send({code: 404, err})
				if(!company) return res.send({code: 404, error: 'Not found the company'})
				delFile(company.logo)
				company.logo = host.clock + req.file.path
				company.save((err)=> {
					if(err) return res.send({code: 404, err})
					res.send({code: 200, company})
				})
			}) 
		})
	})
})

module.exports = router