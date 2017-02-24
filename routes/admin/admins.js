const router = require('express').Router()
	, Admin = require('../../models/Admin')

router.delete('/:id', (req, res)=> {
	const adminId = req.params.id
	Admin.remove({_id: adminId})
	.exec((err)=> {
		if(err) return res.send({code: 404, err})
		res.json({code: 200, message: 'the admin delete success'})
	})
})

module.exports = router