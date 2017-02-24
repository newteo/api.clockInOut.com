const router = require('express').Router()
	, request = require('superagent')
	, User = require('../models/User')
	, Record = require('../models/Record')
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
			if(err) return console.log({code: 404, err})
			console.log('+')
		})
	} else {
		User.update({_id: uId}, 
		{$set: {status: status}}, 
		(err, txt)=> {
			if(err) return console.log({code: 404, err})
			console.log('c')
		})
	}
}
function createRecord(uId, all, res) {
	if(all.hour >= 9 && all.minute > 0) all.normal = false
	const record = new Record({
		owner: uId,
		compenyId: null,
		normal: all.normal,
		longitude: all.lng,
		latitude: all.lat,
		place: all.place,
		today: all.today,
		sweep1: all.time, sweep2: null,
		sweep3: null, sweep4: null,
		sweep5: null, sweep6: null
	})
	record.save((err)=> {
		if(err) return res.send({code: 404, err})
		pushUpdate(uId, 'work', record._id)
		res.send({code: 200, record})
	})
}
function sweepRange(lat, lng) {
	var RR = 1000
		, s = getDistance(23.468907648495, 116.69170184107, lat, lng)
	if(s > RR) return false
	else return true
}

router.post('/punch', (req, res)=> {
	const userId = req.decoded.userId
	const all = {
		hour: null,
		minute: null,
		compenyId: null,
		normal: true,
		lng: null,
		lat: null,
		place: null,
		today: null,
		time: null
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
					if(!same.sweep2) { 
						same.sweep2 = time
						if(hour < 12) same.normal = false
						pushUpdate(userId, 'nowork', null)
					}
					else if(!same.sweep3) { 
						same.sweep3 = time
						if(hour >= 14 && minute > 0) same.normal = false
						pushUpdate(userId, 'work', null)
					}
					else if(!same.sweep4) { 
						same.sweep4 = time
						if(hour < 18) same.normal = false
						pushUpdate(userId, 'nowork', null)
					}
					else if(!same.sweep5) { 
						same.sweep5 = time
						if(hour >= 20 && minute > 0) same.normal = false
						pushUpdate(userId, 'work', null)
					}
					else if(!same.sweep6) { 
						same.sweep6 = time
						if(hour < 22) same.normal = false
						pushUpdate(userId, 'nowork', null)
					}
					same.save((err)=> {
						if(err) return res.send({code: 404, err})
						res.send({code: 200, place: all.place, same})
					})
				}
			})
		} else res.send({code: 401, place: all.place, error: '超出范围，打卡失败'})
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