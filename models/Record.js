const mongoose = require('mongoose')
	, Schema = mongoose.Schema
	, User = require('./User')
	, Compeny = require('./Compeny')

const recordSchema = new Schema({
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	compenyId: {        //所属公司
		type: Schema.Types.ObjectId,
		ref: 'Compeny'
	},
	normal: { type: Boolean },        //是否异常
	longitude: { type: Number },       //经度
	latitude: { type: Number },       //纬度
	place: { type: String },        //地点
	today: { type: Date },        //日期
	sweep1: { type: Date },
	sweep2: { type: Date },
	sweep3: { type: Date },
	sweep4: { type: Date },
	sweep5: { type: Date },
	sweep6: { type: Date },
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