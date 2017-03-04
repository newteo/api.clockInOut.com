const mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , Company = require('./Company')

const sentenceSchema = new Schema({
  num: { type: Number },
  companyId: {        //公司
    type: Schema.Types.ObjectId,
    ref: 'Company'
  },
  text: { type: String },
  createdTime: {
    type: Date, 
    default: Date.now
  }
})
module.exports = mongoose.model('Sentence', sentenceSchema)