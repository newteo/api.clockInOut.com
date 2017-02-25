const router = require('express').Router()
	, request = require('superagent')
	, User = require('../models/User')
	, Record = require('../models/Record')
	, Sweep = require('../models/Sweep')
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
function createRecord(uId, all, res) {
	if(all.hour > 9 || (all.hour == 9 && all.minute > 0)) all.normal = false
	const record = new Record({
		owner: uId,
		compenyId: null,
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
function sweepRange(lat, lng) {
	var RR = 1000
		, s = getDistance(23.466085, 116.680695, lat, lng)
	if(s > RR) return false
	else return true
}

router.post('/punch', (req, res)=> {
	const userId = req.decoded.userId
	const all = {
		hour: null, minute: null, compenyId: null, normal: true,
		lng: null, lat: null, place: null, today: null, time: null
	} 
	var x = Number(req.body.latitude) 
		, y = Number(req.body.longitude)
		, nowdate = new Date(req.body.time)
		, year = nowdate.getFullYear()
		, month = nowdate.getMonth() + 1
		, day = nowdate.getDate()
		, hour = nowdate.getHours()
		, minute = nowdate.getMinutes()
		, second = nowdate.getSeconds()
		, today = `${year}-${month}-${day}`
		, time = `${hour}:${minute}:${second}`
	request.get(`http://apis.map.qq.com/ws/geocoder/v1/?location=${x},${y}&coord_type=3&key=${key}`)
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
		if(sweepRange(x, y)) {
			Record.findOne({owner: userId})
			.where('today').equals(today)
			.exec((err, same)=> {
				if(err) return res.send({code: 404, err})
				if(!same) {
					createRecord(userId, all, res)
				} else {
					var status = 'work'
						, createTF = true
					switch (same.sweeps.length) {
						case 1: { if(hour < 12) same.normal = false
							status = 'nowork' }; break
						case 2: if(hour > 14 || (hour == 14 && minute > 0)) same.normal = false; break
						case 3: { if(hour < 18) same.normal = false
							status = 'nowork' }; break
						case 4: if(hour > 19 || (hour == 19 && minute > 30)) same.normal = false; break
						case 5: { if(hour < 21) same.normal = false
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

router.get('/cos', (req, res)=> {
	const xx = getDistance(23.468152, 116.692299, 23.454166, 116.690709)
	res.send({num: xx})
})


module.exports = router