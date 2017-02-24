const router = require('express').Router()
	, Admin = require('../models/Admin')

router.post('/', (req, res)=> {
	const newteo = req.query.newteo
	if(newteo != process.env.PASS) {
		return res.send(`You have't permission`)
	} else {
		const keeper = new Admin({
			adminName: req.body.adminName,
			password: req.body.password
		})
		keeper.save((err)=> {
			if(err) return res.send({code: 404, err})
			res.send({code: 200, keeper})
		})
	}
})


module.exports = router