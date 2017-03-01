const router = require('express').Router()
	, Admin = require('../../models/Admin')

router.delete('/:id', (req, res)=> {
	const adminId = req.params.id
	Admin.remove({_id: adminId})
	.exec((err)=> {
		if(err) return res.status(404).send(err)
		res.status(200).send({message: 'the admin delete success'})
	})
})

module.exports = router