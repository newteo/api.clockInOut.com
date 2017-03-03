const router = require('express').Router()
  , host = require('../utils/hosturl')

router.get('/', (req, res)=> {
  res.json({
    api: host.clock,
    // login: host.clock + 'login',
    // admin_user: host.clock + 'admin/user?token=${token}',
    session: host.clock + 'session',
    punch: host.clock + 'user/punch?token=${token}',
    info: host.clock + 'user/info?token=${token}',
    records: host.clock + 'user/records?token=${token}'
  })
})

module.exports = router