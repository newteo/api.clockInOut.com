const router = require('express').Router()
	, User = require('../models/User')
	, Record = require('../models/Record')
	, Company = require('../models/Company')
	, ApplyCache = require('../models/ApplyCache')
	, upload = require('../utils/upload')
	, delFile = require('../utils/delFile')
	, host = require('../utils/hosturl')
	, checkToken = require('../utils/checkToken')

checkToken(router)

function createApplyCache(cId) {
	const apply = new ApplyCache({
		_id: cId,
		applyMember: [ ]
	})
	apply.save((err)=> {
		if(err) console.log(err)
		// console.log('applyCache created')
	})
}
function createCompany(uId, body, res) {
	const company = new Company({
		manager: uId,
		name: body.name || null,
		logo: null,
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
		createApplyCache(company._id)
		res.send({code: 200, types: 'manager', company})
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
		createCompany(userId, req.body, res)
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
				if(company.logo) delFile(company.logo)
				company.logo = host.clock + req.file.path
				company.save((err)=> {
					if(err) return res.send({code: 404, err})
					res.send({code: 200, company})
				})
			}) 
		})
	})
})
//更改信息
router.post('/information', (req, res)=> {
	const userId = req.decoded.userId
	Company.findOne({manager: userId}, {__v: 0})
	.populate('manager', 'wxName img types remark')
	.exec((err, company)=> {
		if(err) return res.send({code: 404, err})
		if(!company) return res.send({code: 404, error: 'Not found the company'})
		if(company.manager.types != 'manager') return res.send({code: 404, error: 'You are not the manager'})
		if(req.body.name) company.name = req.body.name
		if(req.body.address) company.address = req.body.address
		if(req.body.phone) company.phone = req.body.phone
		if(req.body.latitude) company.coordinate_latitude = req.body.latitude
		if(req.body.longitude) company.coordinate_longitude = req.body.longitude
		if(req.body.commutingTime) company.commutingTime = req.body.commutingTime
		if(req.body.radius) company.radius = req.body.radius
		if(req.body.remark) company.remark = req.body.remark
		company.save((err)=> {
			if(err) return res.send({code: 404, err})
			res.send({code: 200, company})
		})
	})
})
//删除
router.delete('/now', (req, res)=> {
	const userId = req.decoded.userId
	Company.findOne({manager: userId}, {__v: 0})
	.populate('manager', 'wxName img types remark')
	.exec((err, company)=> {
		if(err) return res.send({code: 404, err})
		if(!company) return res.send({code: 404, error: 'Not found the company'})
		if(company.manager.types != 'manager') return res.send({code: 404, error: 'You are not the manager'})
		if(company.logo) delFile(company.logo)
		if(company.QRcodeUrl) delFile(company.QRcodeUrl)
		ApplyCache.remove({_id: company._id})
		.exec((err)=> {
			if(err) return console.log(err)
		})
		Company.remove({_id: company._id})
		.exec((err)=> {
			if(err) return res.send({code: 404, err})
			User.update({_id: userId}, 
			{$set: { types: 'user', belongsTo: null }}, 
			{upsert: true}, 
			(err, txt)=> {
				if(err) return console.log(err)
				// console.log('user changed')
			})
			res.send({code: 200, message: 'company deleted success'})
		})
	})
})
//获取申请人员列表
router.get('/applylist', (req, res)=> {
	const userId = req.decoded.userId
	Company.findOne({manager: userId})
	.populate('manager', 'wxName img types remark')
	.exec((err, company)=> {
		if(err) return res.send({code: 404, err})
		if(!company) return res.send({code: 404, error: 'Not found the company'})
		if(company.manager.types != 'manager') return res.send({code: 404, error: 'You are not the manager'})
		ApplyCache.findOne({_id: company._id}, {__v: 0, _id: 0})
		.populate('applyMember', 'wxName img types belongsTo')
		.exec((err, applycache)=> {
			if(err) return res.send({code: 404, err})
			res.send({code: 200, applycache})
		})
	})
})
//申请人员验证
router.post('/applylist/:id', (req, res)=> {
	const userId = req.decoded.userId
		, applyId = req.params.id
	if(req.body.validation == 'pass') {
		Company.findOne({manager: userId})
		.exec((err, company)=> {
			if(err) return res.send({code: 404, err})
			if(!company) return res.send({code: 404, error: 'Not found the company'})
			ApplyCache.findOne({_id: company._id})
			.where('applyMember').in([applyId])
			.exec((err, applycache)=> {
				if(err) return res.send({code: 404, err})
				if(!applycache) return res.send({code: 204, message: 'Id is not in the list'})
				applycache.applyMember.pull(applyId)
				company.corporateMember.push(applyId)
				applycache.save((err)=> {
					if(err) return res.send({code: 404, err})
					company.save((err)=> {
						if(err) return res.send({code: 404, err})
						User.update({_id: applyId}, 
						{$set: { types: 'staff', belongsTo: company._id }}, 
						{upsert: true}, 
						(err, txt)=> {
							if(err) return console.log(err)
							// console.log('user changed')
						})
						res.send({code: 200, message: 'add success'})
					})
				})
			})
		})
	} else if(req.body.validation == 'nopass') {
		Company.findOne({manager: userId})
		.exec((err, company)=> {
			if(err) return res.send({code: 404, err})
			if(!company) return res.send({code: 404, error: 'Not found the company'})
			ApplyCache.findOne({_id: company._id})
			.where('applyMember').in([applyId])
			.exec((err, applycache)=> {
				if(err) return res.send({code: 404, err})
				if(!applycache) return res.send({code: 204, message: 'Id is not in the list'})
				applycache.applyMember.pull(applyId)
				applycache.save((err)=> {
					if(err) return res.send({code: 404, err})
					res.send({code: 200, message: 'refuse success'})
				})
			})
		})
	} else {
		res.send({code: 404, error: 'validation is pass or nopass'})
	}
})
//获取成员列表
router.get('/staffs', (req, res)=> {
	const userId = req.decoded.userId
	Company.findOne({manager: userId})
	.populate('corporateMember', 'wxName img status belongsTo remark punchCardRecords')
	.exec((err, company)=> {
		if(err) return res.send({code: 404, err})
		if(!company) return res.send({code: 404, error: 'Not found the company'})
		res.send({code: 200, staffs: company.corporateMember})
	})
})
//获取单天成员打卡信息
router.post('/staffs/day', (req, res)=> {
	const userId = req.decoded.userId
		, today = req.body.today
	Company.findOne({manager: userId})
	.exec((err, company)=> {
		if(err) return res.send({code: 404, err})
		if(!company) return res.send({code: 404, error: 'Not found the company'})
		Record.find({companyId: company._id}, {__v:0, updatedTime:0, companyId:0, createdTime:0})
		.where('today').equals(today)
		.populate('owner', 'wxName img status remark')
		.populate('sweeps', 'place h_m_s')
		.exec((err, staffRecords)=> {
			if(err) return res.send({code: 404, err})
			res.send({code: 200, staffRecords})
		})
	})
})

module.exports = router