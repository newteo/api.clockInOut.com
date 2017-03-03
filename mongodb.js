const mongoose = require('mongoose')
  , db = mongoose.connection

mongoose.connect('mongodb://localhost/clockpunch')
db.on('error', console.error.bind(console, 'connect error:'))
db.once('open', ()=> {
  console.log('mongoose opened!')
})