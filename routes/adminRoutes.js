const router = require('express').Router()
  , index = require('./admin/admins')
  , company = require('./admin/company')
  , record = require('./admin/record')

router.use('/', index)
router.use('/company', company)
router.use('/record', record)

module.exports = router