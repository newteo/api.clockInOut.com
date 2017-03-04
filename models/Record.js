const mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , User = require('./User')
  , Company = require('./Company')
  , Sweep = require('./Sweep')

const recordSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  companyId: {        //所属公司
    type: Schema.Types.ObjectId,
    ref: 'Company'
  },
  normal: { type: Boolean },        //是否异常
  today: { type: String },        //日期
  manHour: { type: Number },        //工时(?h/day)
  sweeps: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Sweep'
  }],
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
module.exports = mongoose.model('Record', recordSchema)