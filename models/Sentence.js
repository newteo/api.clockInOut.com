const mongoose = require('mongoose')
	, Schema = mongoose.Schema
	, Compeny = require('./Compeny')

const sentenceSchema = new Schema({
	num: { type: Number },
	compenyId: {        //公司
		type: Schema.Types.ObjectId,
		ref: 'Compeny'
	},
	text: { type: String },
	createdTime: {
		type: Date, 
		default: Date.now
	}
})
module.exports = mongoose.model('Sentence', sentenceSchema)