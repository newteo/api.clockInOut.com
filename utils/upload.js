const multer = require('multer')

function upload(pubilc, single) {
	const storage = multer.diskStorage({
		destination: (req, file, cb) => {
			cb(null, `storage/${pubilc}`)
		},
		filename: (req, file, cb)=> {
			cb(null, Date.now() + file.originalname )
		}
	})
	const upload = multer({storage: storage}).single(`${single}`)
	return upload
}

module.exports = upload