const mongoose = require('mongoose')
	, Schema = mongoose.Schema
	, User = require('./User')
	, Company = require('./Company')

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
	longitude: { type: Number },       //经度
	latitude: { type: Number },       //纬度
	place: { type: String },        //地点
	today: { type: String },        //日期
	sweep1: { type: String },
	sweep2: { type: String },
	sweep3: { type: String },
	sweep4: { type: String },
	sweep5: { type: String },
	sweep6: { type: String },
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