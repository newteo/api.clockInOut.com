const router = require('express').Router()
	, User = require('../models/User')
	, Record = require('../models/Record')
	, checkToken = require('../utils/checkToken')

checkToken(router)

router.post('/punch', (req, res)=> {
	const userId = req.decoded.userId
	var x = Number(req.body.latitude) 
		, y = Number(req.body.longitude)
		, nowtime = req.body.time
	const record = new Record({
		owner: userId,
		compenyId: null,
		normal: true,
		longitude: y,
		latitude: x,
		place: null,
		today: nowtime,
		sweep1: nowtime, sweep2: null,
		sweep3: null, sweep4: null,
		sweep5: null, sweep6: null
	})
	record.save((err)=> {
		if(err) return res.send({code: 404, err})
		User.update({_id: userId}, 
		{$push: {punchCardRecords: record._id}}, 
		(err, txt)=> {
			if(err) return console.log({code: 404, err})
			console.log('+')
		})
		res.send({code: 200, record})
	})

})
//查看个人信息
router.get('/info', (req, res)=> {
	const userId = req.decoded.userId
	User.findOne({_id: userId})
	.populate('belongsTo')
	.exec((err, user)=> {
		if(err) return res.send({code: 404, err})
		res.send({code: 200, user})
	})
})
//查看个人打卡记录
router.get('/records', (req, res)=> {
	const userId = req.decoded.userId
	Record.find({owner: userId})
	.sort({createdTime: -1})
	.exec((err, records)=> {
		if(err) return res.send({code: 404, err})
		res.send({code: 200, records})
	})
})

module.exports = router