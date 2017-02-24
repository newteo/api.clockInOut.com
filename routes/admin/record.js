const router = require('express').Router()
	, Record = require('../../models/Record')
	, User = require('../../models/User')

router.delete('/all', (req, res)=> {
	Record.remove({})
	.exec((err)=> {
		if(err) return res.send({code: 404, err})
		User.find()
		.exec((err, users)=> {
			if(err) return console.log(err)
			users.map((item)=> {
				item.punchCardRecords = []
				item.save((err)=> {
					if(err) return console.log(err)
				})
			})
		})
		res.send({code: 200, message: 'All record delete success'})
	})
})

module.exports = router