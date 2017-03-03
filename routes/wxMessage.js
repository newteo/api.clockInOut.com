const router = require('express').Router()
  , request = require('superagent')
  , User = require('../models/User')
  , Company = require('../models/Company')
  , wxApis = require('../utils/wxApis')
  , appId = process.env.XCX_ID
  , appSecret = process.env.XCX_SECRET
  , templateId = process.env.TEMPLATE

function getwxToken(callback) {
  request.get(`${wxApis.token}?grant_type=client_credential&appid=${appId}&secret=${appSecret}`)
  .end((err, result)=> {
    if(err) return res.status(404).send(err)
    var accessToken = JSON.parse(result.text).access_token
    typeof callback == 'function' && callback(accessToken)
  })
}

router.post('/sendtomanager', (req, res)=> {

})

router.post('/sendtouser', (req, res)=> {
  const userId = req.body.userId
    , companyId = req.body.companyId
    , formId = req.body.formId
  User.findOne({_id: userId})
  .exec((err, user)=> {
    if(err) return res.send(err)
    if(!user) return res.send({error: 'miss'})
    Company.findOne({_id: companyId})
    .exec((err, company)=> {
      if(err) return res.send(err)
      if(!company) return res.send('misss')
      var value = {
        "keyword1": {
          "value": user.wxName, 
          "color": "#173177"
        }, 
        "keyword2": {
          "value": "公司成员认证", 
          "color": "#173177"
        }, 
        "keyword3": {
          "value": company.name, 
          "color": "#173177"
        }, 
        "keyword4": {
          "value": "审核通过", 
          "color": "#173177"
        },
        "keyword5": {
          "value": "备注", 
          "color": "#173177"
        } 
      }
      getwxToken((wxToken) => {
        request.post(`${wxApis.send}?access_token=${wxToken}`)
        .send({
          touser: 'omHzq0FhLWd4CyhJjJ8VLAebKBKQ',//user.openId
          template_id: templateId,
          page: 'login',
          form_id: formId,
          data: value
        })
        .set('Content-Type', 'application/json')
        .end((err, result)=> {
          if(err) return console.log(err)
          console.log(result.text)
          res.send(result.text)
        })
      })
    })
  })
})

module.exports = router