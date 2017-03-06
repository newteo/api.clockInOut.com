const mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , Record = require('./Record')
  , Company = require('./Company')

const userSchema = new Schema({
  openId: { type: String },
  formId: { type: String },
  wxName: { type: String },
  img: { type: String },
  employeeID: { type: String },
  realName: { type: String },
  types: {        //类型
    type: String,
    enum: ['manager', 'staff', 'user'] 
  },
  status: { 
    type: String,
    enum: ['work', 'nowork'] 
  },
  belongsTo: {        //所属公司
    type: Schema.Types.ObjectId,
    ref: 'Company'
  },
  punchCardRecords: [{
    type: Schema.Types.ObjectId,
    ref: 'Record'
  }],
  remark: { type: String },        //*留给公司备注*
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
module.exports = mongoose.model('User', userSchema)