const router = require('express').Router()
	, request = require('superagent')
	, jwt = require('jsonwebtoken')
	, wxApis = require('../utils/wxApis')
	, WXBizDataCrypt = require('../utils/WXBizDataCrypt')
	, checkNewTeo = require('../utils/checkNewTeo')
	, User = require('../models/User')
	, salt = process.env.SALT
	, xcxId = process.env.XCX_ID
	, xcxSecret = process.env.XCX_SECRET

function setinfo(wxInfo, res) {
	User.findOne({openId: wxInfo.openId})
	.exec((err, same)=> {
		if(same) {
			jwt.sign({userId: same._id}, 
			salt, 
			{expiresIn: '7d'}, 
			(err, token)=> {
				if(err) return res.send({code: 404, err})
				// console.log('ok')
				res.send({code: 200, status: same.status, token: token})
			})
		} else {
			const info = new User({
				openId: wxInfo.openId,
				wxName: wxInfo.nickName,
				img: wxInfo.avatarUrl,
				employeeID: null,
				realName: null,
				status: 'nowork',
				belongsTo: null,
				punchCardRecords: [],
				remark: null,
			})
			info.save((err)=> {
				if(err) return res.send({code: 404, err})
				jwt.sign({userId: info._id}, 
				salt, 
				{expiresIn: '7d'}, 
				(err, token)=> {
					if(err) return res.send({code: 404, err})
					res.send({code: 200, status: info.status, token: token})
				})
			})
		}
	})
}

checkNewTeo(router)

router.get('/', (req, res)=> {
	const code = req.query.code
	, iv = req.query.iv 
	, encryptedData = req.query.encryptedData
	if (!code || !iv || !encryptedData)
		return res.send({message: 'Missing Query String!'})
	request.get(`${wxApis.session}?appid=${xcxId}&secret=${xcxSecret}&js_code=${code}&grant_type=authorization_code`)
	.end((err, result)=> {
		if(!JSON.parse(result.text).errcode) {
			const sessionKey = JSON.parse(result.text).session_key
			const pc = new WXBizDataCrypt(xcxId, sessionKey)
			const wxInfo = pc.decryptData(encryptedData, iv)
			delete wxInfo.watermark    //(！！！)
			// console.log(wxInfo)
			setinfo(wxInfo, res)
		} else res.send(result.text)
	})
})

module.exports = router