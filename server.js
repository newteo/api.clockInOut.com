const express = require('express')
	, app = express()

require('./mongodb')
require('dotenv').config()

const port = process.env.PORT
	, routes = require('./routes')
	, admin = require('./routes/adminRoutes')

const cors = require('cors')
	, bodyParser = require('body-parser')

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/public', express.static('public'))

app.use('/newteo', routes.newteo)
app.use('/newteomemo', routes.newteomemo)
app.use('/', routes.home)
app.use('/reg', routes.reg)
app.use('/login', routes.login)
app.use('/user', routes.user)
app.use('/company', routes.company)
app.use('/session', routes.session)
app.use('/qrcode', routes.qrcode)
app.use('/admin', admin)

app.listen(port, ()=> {
	console.log('Server is ruuning on port: ' + port)
	console.log('Use Ctrl-C to stop')
})