const router = require('express').Router()
	, request = require('superagent')
	, jwt = require('jsonwebtoken')
	, wxApis = require('../utils/wxApis')
	, WXBizDataCrypt = require('../utils/WXBizDataCrypt')
	, checkNewTeo = require('../utils/checkNewTeo')
	, Older = require('../models/Older')
	, xcxId = process.env.XCX_ID
	, xcxSecret = process.env.XCX_SECRET

function setinfo(wxInfo, res) {
	Older.findOne({openId: wxInfo.openId})
	.exec((err, same)=> {
		if(same) {
			jwt.sign({userId: same._id}, 
			'newteo.com', 
			{expiresIn: '7d'}, 
			(err, token)=> {
				if(err) return res.status(404).send(err)
				// console.log('ok')
				res.status(201).send({token: token})
			})
		} else {
			const info = new Older({
				openId: wxInfo.openId,
				wxName: wxInfo.nickName,
				img: wxInfo.avatarUrl,
				memoes: []
			})
			info.save((err)=> {
				if(err) return res.status(404).send(err)
				jwt.sign({userId: info._id}, 
				'newteo.com', 
				{expiresIn: '7d'}, 
				(err, token)=> {
					if(err) return res.status(404).send(err)
					res.status(201).send({token: token})
				})
			})
		}
	})
}

checkNewTeo(router)

router.get('/session', (req, res)=> {
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
		} else res.status(404).send(result.text)
	})
})

module.exports = router