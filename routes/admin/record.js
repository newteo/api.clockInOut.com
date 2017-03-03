const router = require('express').Router()
  , Record = require('../../models/Record')
  , User = require('../../models/User')

router.delete('/all', (req, res)=> {
  Record.remove({})
  .exec((err)=> {
    if(err) return res.status(404).send(err)
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
    res.status(200).send({message: 'All record delete success'})
  })
})

module.exports = router