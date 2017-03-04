const mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , User = require('./User')
  , Sentence = require('./Sentence')

const companySchema = new Schema({
  manager: {        //公司管理员
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  name: { type: String },
  logo: { type: String },
  address: { type: String },
  phone: { type: Number },
  coordinate_latitude: { type: Number },        //坐标纬度
  coordinate_longitude: { type: Number },        //坐标经度
  commutingTime: [{ type: String }],        //上下班时间
  radius: { type: Number },        //半径
  corporateMember: [{        //公司成员
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  mottos: [{        //公司格言
    type: Schema.Types.ObjectId,
    ref: 'Sentence'
  }],
  QRcodeUrl: { type: String },        //打卡二维码
  remark: { type: String },
  createdTime: {
    type: Date, 
    default: Date.now
  },
  updatedTime: {
    type: Date, 
    default: Date.now
  }
}, {
  timestamps: {
    createdAt: 'createdTime',
    updatedAt: 'updatedTime'
  }
})
module.exports = mongoose.model('Company', companySchema)