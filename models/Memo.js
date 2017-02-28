const mongoose = require('mongoose')
	, Schema = mongoose.Schema
	, Older = require('./Older')

const memoSchema = new Schema({
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'Older'
	},
	lng: { type: Number },       //经度
	lat: { type: Number },       //纬度
	address: { type: String },        //地点
	input: { type: String },
	createdTime: {
		type: Date, 
		default: Date.now
	}
})
module.exports = mongoose.model('Memo', memoSchema)