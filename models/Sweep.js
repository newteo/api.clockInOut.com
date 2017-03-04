const mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , User = require('./User')

const sweepSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  lng: { type: Number },       //经度
  lat: { type: Number },       //纬度
  place: { type: String },        //地点
  h_m_s: { type: String },        //时分秒
  conditions: {
    type: String,
    enum: ['OK', 'LATE', 'EARLY']
  },
  createdTime: {
    type: Date, 
    default: Date.now
  }
})
module.exports = mongoose.model('Sweep', sweepSchema)