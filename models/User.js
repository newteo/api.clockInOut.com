const mongoose = require('mongoose')
	, Schema = mongoose.Schema
	, Record = require('./Record')
	, Company = require('./Company')

const userSchema = new Schema({
	openId: { type: String },
	wxName: { type: String },
	img: { type: String },
	employeeID: { type: String },
	realName: { type: String },
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
	remark: { type: String },
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