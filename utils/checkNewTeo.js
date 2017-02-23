const jsSHA = require('jssha')
	, raw = process.env.RAW

function checkNewTeo(router) {
	router.use('*', (req, res, next) => {
		var encryptedNewteo = req.query.newteo 
			, shaObj = new jsSHA('SHA-1', 'TEXT')
		shaObj.update(raw)
		if(shaObj.getHash('HEX') === encryptedNewteo) next()
		else res.send({message: `You have't permission`})
	})
}

module.exports = checkNewTeo