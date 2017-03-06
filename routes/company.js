const router = require('express').Router()
  , request = require('superagent')
  , User = require('../models/User')
  , Record = require('../models/Record')
  , Company = require('../models/Company')
  , ApplyCache = require('../models/ApplyCache')
  , upload = require('../utils/upload')
  , delFile = require('../utils/delFile')
  , host = require('../utils/hosturl')
  , checkToken = require('../utils/checkToken')
  , wxApis = require('../utils/wxApis')
  , appId = process.env.XCX_ID
  , appSecret = process.env.XCX_SECRET
  , templateId = process.env.TEMPLATE

checkToken(router) 

function changeUser(members) {
  members.map((item)=> {
    User.update({_id: item}, 
    {$set: {types: 'user', belongsTo: null, remark: null}}, 
    {upsert: true}, 
    (err, txt)=> {
      if(err) return console.log(err)
    })
  })
}
function createApplyCache(cId) {
  const apply = new ApplyCache({
    _id: cId,
    applyMember: [ ]
  })
  apply.save((err)=> {
    if(err) console.log(err)
    // console.log('applyCache created')
  })
}
function createCompany(uId, body, res) {
  const company = new Company({
    manager: uId,
    name: body.name || null,
    logo: null,
    address: body.address || null,
    coordinate_latitude: body.latitude || null,
    coordinate_longitude: body.longitude || null,
    phone: body.phone || null,
    commutingTime: body.commutingTime || [ '8:00', '12:00', '14:00', '18:00', null, null],
    radius: body.radius || 100,
    corporateMember: [ ],
    mottos: [ ],
    QRcodeUrl: null,
    remark: null
  })
  company.save((err)=> {
    if(err) return res.status(404).send(err)
    User.update({_id: uId}, 
    {$set: {
      types: 'manager',
      belongsTo: company._id
    }}, 
    {upsert: true}, 
    (err, txt)=> {
      if(err) return console.log(err)
      // console.log('user changed')
    })
    createApplyCache(company._id)
    res.status(201).send({types: 'manager', company})
  })
}
function getwxToken(callback) {
  request.get(`${wxApis.token}?grant_type=client_credential&appid=${appId}&secret=${appSecret}`)
  .end((err, result)=> {
    if(err) return rconsole.log(err)
    var accessToken = JSON.parse(result.text).access_token
    typeof callback == 'function' && callback(accessToken)
  })
}
function messageSendToUser(uId, cId) {
  User.findOne({_id: uId})
  .exec((err, user)=> {
    if(err) return console.log(err)
    if(!user) return 
    Company.findOne({_id: cId})
    .exec((err, company)=> {
      if(err) return console.log(err)
      if(!company) return 
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
          touser: user.openId,
          template_id: templateId,
          page: '/pages/login/login',
          form_id: user.formId,
          data: value
        })
        .set('Content-Type', 'application/json')
        .end((err, result)=> {
          if(err) return console.log(err)
          console.log(result.text)
          // res.send(result.text)
        })
      })
    })
  })
}

//创建公司信息
router.post('/new', (req, res)=> {
  const userId = req.decoded.userId
  const logoUpload = upload('logos', 'logo')
  Company.findOne({manager: userId})
  .exec((err, exist)=> {
    if(err) return res.status(404).send(err)
    if(exist) return res.status(403).send({error: 'You had created one company'})
    createCompany(userId, req.body, res)
  })
})
//更改logo
router.post('/logo', (req, res)=> {
  const userId = req.decoded.userId
  const logoUpload = upload('logos', 'logo')
  User.findOne({_id: userId})
  .exec((err, user)=> {
    if(err) return res.status(404).send(err)
    if(!user) return res.status(404).send({error: 'Please to make sure for your information whether is deleted'})
    if(user.types != 'manager') return res.status(404).send({error: 'You are not the manager'})
    logoUpload(req, res, (err)=> {
      if(err) return res.status(404).send(err)
      Company.findOne({_id: user.belongsTo})
      .exec((err, company)=> {
        if(err) return res.status(404).send(err)
        if(!company) return res.status(404).send({error: 'Not found the company'})
        if(company.logo) delFile(company.logo)
        company.logo = host.clock + req.file.path
        company.save((err)=> {
          if(err) return res.status(404).send(err)
          res.status(201).send(company)
        })
      }) 
    })
  })
})
//更改信息
router.post('/information', (req, res)=> {
  const userId = req.decoded.userId
  Company.findOne({manager: userId}, {__v: 0})
  .populate('manager', 'wxName img types remark')
  .exec((err, company)=> {
    if(err) return res.status(404).send(err)
    if(!company) return res.status(404).send({error: 'Not found the company'})
    if(company.manager.types != 'manager') return res.status(404).send({error: 'You are not the manager'})
    if(req.body.name) company.name = req.body.name
    if(req.body.address) company.address = req.body.address
    if(req.body.phone) company.phone = req.body.phone
    if(req.body.latitude) company.coordinate_latitude = req.body.latitude
    if(req.body.longitude) company.coordinate_longitude = req.body.longitude
    if(req.body.commutingTime) company.commutingTime = req.body.commutingTime
    if(req.body.radius) company.radius = req.body.radius
    if(req.body.remark) company.remark = req.body.remark
    company.save((err)=> {
      if(err) return res.status(404).send(err)
      res.status(201).send(company)
    })
  })
})
//删除
router.delete('/now', (req, res)=> {
  const userId = req.decoded.userId
  var members = []
  Company.findOne({manager: userId}, {__v: 0})
  .populate('manager', 'wxName img types remark')
  .exec((err, company)=> {
    if(err) return res.status(404).send(err)
    if(!company) return res.status(404).send({error: 'Not found the company'})
    if(company.manager.types != 'manager') return res.status(404).send({error: 'You are not the manager'})
    if(company.logo) delFile(company.logo)
    if(company.QRcodeUrl) delFile(company.QRcodeUrl)
    if(company.corporateMember) {
      members = company.corporateMember
      changeUser(members)
    }
    ApplyCache.remove({_id: company._id})
    .exec((err)=> {
      if(err) return console.log(err)
    })
    Company.remove({_id: company._id})
    .exec((err)=> {
      if(err) return res.status(404).send(err)
      User.update({_id: userId}, 
      {$set: { types: 'user', belongsTo: null }}, 
      {upsert: true}, 
      (err, txt)=> {
        if(err) return console.log(err)
        // console.log('user changed')
      })
      res.status(200).send({types: 'user', message: 'company deleted success'})
    })
  })
})
//获取申请人员列表
router.get('/applylist', (req, res)=> {
  const userId = req.decoded.userId
  Company.findOne({manager: userId})
  .populate('manager', 'wxName img types remark')
  .exec((err, company)=> {
    if(err) return res.status(404).send(err)
    if(!company) return res.status(404).send({error: 'Not found the company'})
    if(company.manager.types != 'manager') return res.status(404).send({error: 'You are not the manager'})
    ApplyCache.findOne({_id: company._id}, {__v: 0, _id: 0})
    .populate('applyMember', 'wxName img types belongsTo')
    .exec((err, applycache)=> {
      if(err) return res.status(404).send(err)
      res.status(200).send(applycache)
    })
  })
})
//申请人员验证
router.post('/applylist/:id', (req, res)=> {
  const userId = req.decoded.userId
    , applyId = req.params.id
  if(req.body.validation == 'pass') {
    Company.findOne({manager: userId})
    .exec((err, company)=> {
      if(err) return res.status(404).send(err)
      if(!company) return res.status(404).send({error: 'Not found the company'})
      ApplyCache.findOne({_id: company._id})
      .where('applyMember').in([applyId])
      .exec((err, applycache)=> {
        if(err) return res.status(404).send(err)
        if(!applycache) return res.status(404).send({message: 'Id is not in the list'})
        applycache.applyMember.pull(applyId)
        company.corporateMember.push(applyId)
        applycache.save((err)=> {
           if(err) return res.status(400).send(err)
           company.save((err)=> {
            if(err) return res.status(400).send(err)
            User.update({_id: applyId}, 
            {$set: { types: 'staff', belongsTo: company._id }}, 
            {upsert: true}, 
            (err, txt)=> {
              if(err) return console.log(err)
              // setTimeout(function() {
              messageSendToUser(applyId, company._id)
              // }, 10000)
              res.status(201).send({message: 'add success'})
              // console.log('user changed')
            })
          })
        })
      })
    })
  } else if(req.body.validation == 'nopass') {
    Company.findOne({manager: userId})
    .exec((err, company)=> {
      if(err) return res.status(404).send(err)
      if(!company) return res.status(404).send({error: 'Not found the company'})
      ApplyCache.findOne({_id: company._id})
      .where('applyMember').in([applyId])
      .exec((err, applycache)=> {
        if(err) return res.status(404).send(err)
        if(!applycache) return res.status(404).send({message: 'Id is not in the list'})
        applycache.applyMember.pull(applyId)
        applycache.save((err)=> {
          if(err) return res.status(400).send(err)
          res.status(201).send({message: 'refuse success'})
        })
      })
    })
  } else {
    res.status(400).send({error: 'validation is pass or nopass'})
  }
})
//获取成员列表
router.get('/staffs', (req, res)=> {
  const userId = req.decoded.userId
  Company.findOne({manager: userId})
  .populate('corporateMember', 'wxName img status belongsTo remark punchCardRecords')
  .exec((err, company)=> {
    if(err) return res.status(404).send(err)
    if(!company) return res.status(404).send({error: 'Not found the company'})
    res.status(200).send({staffs: company.corporateMember})
  })
})
//获取单天成员打卡信息
router.get('/staffs/day', (req, res)=> {
  const userId = req.decoded.userId
    , today = req.query.today
  var member = []
  Company.findOne({manager: userId})
  .populate('corporateMember', 'wxName img status belongsTo remark punchCardRecords')
  .exec((err, company)=> {
    if(err) return res.status(404).send(err)
    if(!company) return res.status(404).send({error: 'Not found the company'})
    Record.find({companyId: company._id}, {__v:0, updatedTime:0, companyId:0, createdTime:0})
    .where('today').equals(today)
    .populate('sweeps', 'place h_m_s conditions')
    .exec((err, records)=> {
      if(err) return res.status(404).send(err)
      company.corporateMember.map((staff)=> {
        var card = records.map((item)=> { 
          if(String(item.owner) == String(staff._id)) return item
          else return null
        })
        member.push({
          _id: staff._id,
          wxName: staff.wxName,
          img: staff.img,
          remark: staff.remark,
          punchCardRecord: card
        })
      })
      res.status(200).send(member)
    })
  })
})
//改备注
router.post('/staffs/:id/remark', (req, res)=> {
  const userId = req.decoded.userId
    , staffId = req.params.id
  Company.findOne({manager: userId})
  .where('corporateMember').in([staffId])
  .exec((err, company)=> {
    if(err) return res.status(404).send(err)
    if(!company) return res.status(404).send({error: 'Not found the company or staff Id'})
    User.findOneAndUpdate({_id: staffId}, 
    {$set: {remark: req.body.remark}}, 
    {new: true},	
    (err, user)=> {
      if(err) return res.status(400).send(err)
      res.status(201).send(user)
    })
  })
})
// 
router.get('/staffs/:id/', (req, res)=> {
  const userId = req.decoded.userId
    , staffId = req.params.id
    , today = req.query.today
    , re = new RegExp(today, 'i')
  Company.findOne({manager: userId})
  .where('corporateMember').in([staffId])
  .exec((err, company)=> {
    if(err) return res.status(404).send(err)
    if(!company) return res.status(404).send({error: 'Not found the company or staff Id'})
    Record.find({owner: staffId})
    .where('companyId').equals(company._id)
    .where('today').regex(re)
    .populate('owner', 'wxName img remark')
    .populate('sweeps', 'place h_m_s conditions')
    .exec((err, records)=> {
      if(err) return res.status(404).send(err)
      res.status(200).send(records)
    })
  })
})
//时间段
router.get('/staffs/:id/time', (req, res)=> {
  const userId = req.decoded.userId
    , staffId = req.params.id
  var start = new Date(req.query.start.replace(/\-/g, ','))
    , end = new Date(req.query.end.replace(/\-/g, ','))
  Company.findOne({manager: userId})
  .where('corporateMember').in([staffId])
  .exec((err, company)=> {
    if(err) return res.status(404).send(err)
    if(!company) return res.status(404).send({error: 'Not found the company or staff Id'})
    Record.find({owner: staffId},  {__v:0})
    .where('companyId').equals(company._id)
    .where('createdTime').gte(start).lt(end)
    .populate('owner', 'wxName img remark')
    .populate('sweeps', 'place h_m_s conditions')
    .exec((err, records)=> {
      if(err) return res.status(404).send(err)
      res.status(200).send(records)
    })
  })
})

module.exports = router