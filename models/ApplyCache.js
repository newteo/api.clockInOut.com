const mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , User = require('./User')

const applyCacheSchema = new Schema({
  applyMember: [{        //申请人员
    type: Schema.Types.ObjectId,
    ref: 'User'
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
module.exports = mongoose.model('ApplyCache', applyCacheSchema)