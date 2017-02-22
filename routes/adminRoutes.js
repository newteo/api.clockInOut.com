const router = require('express').Router()
	, index = require('./admin/admins')

router.use('/', index)

module.exports = router