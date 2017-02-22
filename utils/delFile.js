const fs = require('fs')
	, host = require('./hosturl')

function delFile(url) {
	var num = host.bridge.split('').length
	fs.unlink(url.substring(num), (err)=> {
		if(err) return console.log(err)
		// console.log(url.substring(num) + ' delete success')
	})
}

module.exports = delFile