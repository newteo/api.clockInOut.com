const router = require('express').Router()
	, Admin = require('../models/Admin')
	, jwt = require('jsonwebtoken')

router.post('/', (req, res)=> {
	Admin.findOne({adminName: req.body.adminName})
	.exec((err, keeper)=> {
		if(err) return res.send({code: 404, err})
		if(!keeper) return res.send({error: 'Not found the admin'})
		if(keeper.password == req.body.password) {
			jwt.sign(
				{},
				'guojing',
				{expiresIn: '1d'}, 
				(err, token) => {
					if(err) return res.send({code: 404, err})
					res.send({code: 200, token: token})
				}
			)
		} else res.send({code: 401, error: 'Password error'})
	})
})

module.exports = router