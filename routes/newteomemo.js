const router = require('express').Router()
	, request = require('superagent')
	, checkOldToken = require('../utils/checkOldToken')
	, Older = require('../models/Older')
	, Memo = require('../models/Memo')
	, key = process.env.QQKEY

checkOldToken(router)

router.post('/new', (req, res)=> {
	const olderId = req.decoded.userId
		, lnglng = Number(req.body.longitude)
		, latlat = Number(req.body.latitude)
		, input = req.body.input
	var places
	request.get(`https://apis.map.qq.com/ws/geocoder/v1/?location=${latlat},${lnglng}&coord_type=3&key=${key}`)
	.end((err, qqtxt)=> {
		if(err) return res.send({code: 404, err})
		if(JSON.parse(qqtxt.text).status == 365) return res.send({code: 365, error: '纬度不能超过±90'})
		if(JSON.parse(qqtxt.text).result.formatted_addresses) {
			places = JSON.parse(qqtxt.text).result.formatted_addresses.recommend
		} else { places = JSON.parse(qqtxt.text).result.address }
		const memo = new Memo({
			owner: olderId,
			lng: lnglng,
			lat: latlat,
			place: places,
			input: input
		})
		memo.save((err)=> {
			if(err) return res.send({code: 404, err})
			Older.update({_id: olderId}, 
			{$push: {memoes: memo._id}}, 
			(err, txt)=> {
				if(err) return console.log(err)
			})
			res.send({code: 200, memo})
		})
	})
})

// router.get('/all', (req, res)=> {

// })

// router.delete('/one/:id', (req, res)=> {

// })

module.exports = router