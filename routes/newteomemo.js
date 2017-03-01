const router = require('express').Router()
	, moment = require('moment')
	, request = require('superagent')
	, checkOldToken = require('../utils/checkOldToken')
	, filters = require('../utils/filter')
	, Older = require('../models/Older')
	, Memo = require('../models/Memo')

checkOldToken(router)

router.post('/new', (req, res)=> {
	const olderId = req.decoded.userId
		, lnglng = Number(req.body.longitude)
		, latlat = Number(req.body.latitude)
		, input = req.body.input
		, address = req.body.address
	const memo = new Memo({
		owner: olderId,
		lng: lnglng,
		lat: latlat,
		address: address,
		input: filters(input)
	})
	memo.save((err)=> {
		if(err) return res.status(404).send(err)
		Older.update({_id: olderId}, 
		{$push: {memoes: memo._id}}, 
		(err, txt)=> {
			if(err) return console.log(err)
		})
		res.status(201).send(memo)
	})
})

router.get('/all', (req, res)=> {
	const olderId = req.decoded.userId
	var memos = []
		, createdTime
	Memo.find({owner: olderId})
	.exec((err, memoss)=> {
		if(err) return res.status(404).send(err)
		memoss.map((item)=> {
			createdTime = moment(item.createdTime).format('YYYY-MM-DD h:mm:ss')
			memos.push({
				_id: item._id,
				address: item.address,
				input: item.input,
				createdTime: createdTime
			})
		})
		res.status(200).send(memos)
	})
})

router.delete('/one/:id', (req, res)=> {
	const olderId = req.decoded.userId
		, memoId = req.params.id
	Older.findOne({_id: olderId})
	.where('memoes').in([memoId])
	.exec((err, exist)=> {
		if(err) return res.status(404).send(err)
		console.log(exist)
		if(exist) {
			Older.update({_id: olderId}, 
			{$pull: {memoes: memoId}}, 
			(err, txt)=> {
				if(err) return console.log(err)
			})
			Memo.remove({_id: memoId})
			.exec((err)=> {
				if(err) return res.status(404).send(err)
				res.status(200).send({message: 'delete success'})
			})
		} else res.status(404).send({error: 'Not found this memo'})
	})
})

module.exports = router