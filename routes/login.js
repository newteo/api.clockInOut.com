const router = require('express').Router()
  , Admin = require('../models/Admin')
  , jwt = require('jsonwebtoken')

router.post('/', (req, res)=> {
  Admin.findOne({adminName: req.body.adminName})
  .exec((err, keeper)=> {
    if(err) return res.status(404).send(err)
    if(!keeper) return res.status(404).send({error: 'Not found the admin'})
    if(keeper.password == req.body.password) {
      jwt.sign(
        {},
        'guojing',
        {expiresIn: '1d'}, 
        (err, token) => {
          if(err) return res.status(404).send(err)
          res.status(200).send({token: token})
        }
      )
    } else res.status(401).send({error: 'Password error'})
  })
})

module.exports = router