const router = require('express').Router()
	, request = require('superagent')
	, User = require('../models/User')
	, Sweep = require('../models/Sweep')
	, Record = require('../models/Record')
	, Company = require('../models/Company')
	, ApplyCache = require('../models/ApplyCache')
	, checkToken = require('../utils/checkToken')
	, getDistance = require('../utils/getDistance')
	, key = process.env.QQKEY

checkToken(router)

function pushUpdate(uId, status, rId) {
	if(rId) {
		User.update({_id: uId}, 
		{$set: {status: status},
		 $push: {punchCardRecords: rId}}, 
		(err, txt)=> {
			if(err) return console.log(err)
			// console.log('+')
		})
	} else {
		User.update({_id: uId}, 
		{$set: {status: status}}, 
		(err, txt)=> {
			if(err) return console.log(err)
			// console.log('status')
		})
	}
}
function createSweep(uId, all, rId, res) {
	const sweepp = new Sweep({
		owner: uId,
		lng: all.lng,
		lat: all.lat,
		place: all.place,
		h_m_s: all.time
	})
	sweepp.save((err)=> {
		if(err) return res.send({code: 404, err})
		Record.update({_id: rId}, 
		{$push: {sweeps: sweepp._id}}, 
		(err, txt)=> {
			if(err) return console.log(err)
			// console.log('sw+')
		})
		Sweep.findOne({_id: sweepp._id}, {__v:0, lng:0, lat:0, })
		.populate('owner', '-_id updatedTime wxName img employeeID realName status')
		.exec((err, sweep)=> {
			if(err) return res.send({code: 404, err})
			res.send({code: 200, sweep})
		})
	})
}
function createRecord(t1, uId, all, res) {
	t1 = t1.split(':')
	if(all.hour > Number(t1[0]) || (all.hour == Number(t1[0]) && all.minute > Number(t1[1]))) all.normal = false
	const record = new Record({
		owner: uId,
		companyId: all.companyId,
		normal: all.normal,
		today: all.today,
		sweeps: []
	})
	record.save((err)=> {
		if(err) return res.send({code: 404, err})
		pushUpdate(uId, 'work', record._id)
		createSweep(uId, all, record._id, res)
	})
}
function sweepRange(companyData, lat, lng) {
	var s = getDistance(companyData.Lat, companyData.Lng, lat, lng)
	if(s > companyData.R) return false
	else return true
}

router.post('/punch/:id', (req, res)=> {
	const userId = req.decoded.userId
		, encryptId = req.params.id
		, all = {
		hour: null, minute: null, companyId: null, normal: true,
		lng: null, lat: null, place: null, today: null, time: null
	} 
		, companyData = {
		Lat: null, Lng: null, R: null, t1: null, t2: null, t3: null, t4: null, t5: null, t6: null
	}
	var x = Number(req.body.latitude) 
		, y = Number(req.body.longitude)
		, nowdate = new Date(req.body.time)
		, year = nowdate.getFullYear()
		, month = (nowdate.getMonth() + 1) < 10 ? '0' + (nowdate.getMonth() + 1) : nowdate.getMonth() + 1
		, day = nowdate.getDate() < 10 ? '0' + nowdate.getDate() : nowdate.getDate()
		, hour = nowdate.getHours()
		, minute = nowdate.getMinutes()
		, second = nowdate.getSeconds()
		, today = `${year}-${month}-${day}`
		, time = `${hour}:${minute}:${second}`
	request.get(`https://apis.map.qq.com/ws/geocoder/v1/?location=${x},${y}&coord_type=3&key=${key}`)
	.end((err, qqtxt)=> {
		if(err) return res.send({code: 404, err})
		if(JSON.parse(qqtxt.text).result.formatted_addresses) {
			all.place = JSON.parse(qqtxt.text).result.formatted_addresses.recommend
		} else all.place = JSON.parse(qqtxt.text).result.address
		all.hour = hour
		all.minute = minute
		all.lat = x
		all.lng = y
		all.today = today
		all.time = time
		all.companyId = encryptId
		Company.findOne({_id: encryptId})
		.exec((err, company)=> {
			if(err) return res.send({code: 404, err})
			if(!company) return res.send({code: 404, error: 'Not found the company'})
			companyData.Lat = company.coordinate_latitude
			companyData.Lng = company.coordinate_longitude
			companyData.R = company.radius
			companyData.t1 = company.commutingTime[0] || null
			companyData.t2 = company.commutingTime[1] || null
			companyData.t3 = company.commutingTime[2] || null
			companyData.t4 = company.commutingTime[3] || null
			companyData.t5 = company.commutingTime[4] || null
			companyData.t6 = company.commutingTime[5] || null
			companyData.t2 = companyData.t2.split(':')
			companyData.t3 = companyData.t3.split(':')
			companyData.t4 = companyData.t4.split(':')
			companyData.t5 = companyData.t5.split(':')
			companyData.t6 = companyData.t6.split(':')
			if(sweepRange(companyData, x, y)) {
				Record.findOne({owner: userId})
				.where('today').equals(today)
				.exec((err, same)=> {
					if(err) return res.send({code: 404, err})
					if(!same) {
						createRecord(companyData.t1, userId, all, res)
					} else {
						var status = 'work'
							, createTF = true
						switch (same.sweeps.length) {
							case 1: { if(hour < Number(companyData.t2[0]) || (hour == Number(companyData.t2[0]) && minute < Number(companyData.t2[1]))) same.normal = false
								status = 'nowork' }; break
							case 2: if(hour > Number(companyData.t3[0]) || (hour == Number(companyData.t3[0]) && minute > Number(companyData.t3[1]))) same.normal = false; break
							case 3: { if(hour < Number(companyData.t4[0]) || (hour == Number(companyData.t4[0]) && minute < Number(companyData.t4[1]))) same.normal = false
								status = 'nowork' }; break
							case 4: if(hour > Number(companyData.t5[0]) || (hour == Number(companyData.t5[0]) && minute > Number(companyData.t5[1]))) same.normal = false; break
							case 5: { if(hour < Number(companyData.t6[0]) || (hour == Number(companyData.t6[0]) && minute < Number(companyData.t6[1]))) same.normal = false
								status = 'nowork' }; break
							default: { same.normal = false, status = 'nowork', createTF = false }
						}
						if(createTF) createSweep(userId, all, same._id, res)
						pushUpdate(userId, status, null)
						same.save((err)=> {
							if(err) return console.log(err)
							if(!createTF) res.send({code: 404, error: '超过打卡次数限制(6次/天)，打卡无效'})
						})
					}
				})
			} else res.send({code: 401, place: all.place, error: '超出范围'})
		})
	})
})

//查看个人信息
router.get('/info', (req, res)=> {
	const userId = req.decoded.userId
	User.findOne({_id: userId}, {__v:0})
	.populate('belongsTo')
	.exec((err, user)=> {
		if(err) return res.send({code: 404, err})
		res.send({code: 200, user})
	})
})

//查看个人打卡记录
router.get('/records', (req, res)=> {
	const userId = req.decoded.userId
	Record.find({owner: userId}, {__v:0})
	.populate('owner', '-_id wxName img employeeID realName status')
	.populate('sweeps', '-_id place h_m_s createdTime')
	.sort({createdTime: -1})
	.exec((err, records)=> {
		if(err) return res.send({code: 404, err})
		res.send({code: 200, records})
	})
})
//查看所有公司列表
router.get('/companies', (req, res)=> {
	Company.find({}, {name:1, logo:1, address:1})
	.exec((err, companies)=> {
		if(err) return res.send({code: 404, err})
		res.send({code: 200, companies})
	})
})
//单公司详情
router.get('/company/:id', (req, res)=> {
	const companyId = req.params.id
	Company.findOne({_id: companyId}, {__v:0, coordinate_latitude:0, coordinate_longitude:0})
	.exec((err, company)=> {
		if(err) return res.send({code: 404, err})
		if(!company) return res.send({code: 404, error: 'Not found the company'})
		res.send({code: 200, company})
	})
})
//申请加入公司
router.post('/company', (req, res)=> {
	const userId = req.decoded.userId
		, companyId = req.body.companyId
	ApplyCache.findOne({_id: companyId})
	.where('applyMember').in([userId])
	.exec((err, exist)=> {
		if(err) return res.send({code: 404, err})
		if(exist) {
			return res.send({code: 202, message: '已提交过申请'})
		} else {
			ApplyCache.findOneAndUpdate({_id: companyId}, 
			{$push: {applyMember: userId}}, 
			{new: true}, 
			(err, applycache)=> {
				if(err) return res.send({code: 404, err})
				res.send({code: 200, message: '申请已提交'})
			})
		}
	})
})

module.exports = router