const mongoose = require('mongoose')
  , Schema = mongoose.Schema

const adminSchema = new Schema({
  adminName: { 
    type: String,
    required: true,
    unique: true
  },
  password: { 
    type: String,
    required: true 
  },
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
module.exports = mongoose.model('Admin', adminSchema)