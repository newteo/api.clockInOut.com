const mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , Memo = require('./Memo')

const olderSchema = new Schema({
  openId: { type: String },
  wxName: { type: String },
  img: { type: String },
  memoes: [{
    type: Schema.Types.ObjectId,
    ref: 'Memo'
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
module.exports = mongoose.model('Older', olderSchema)