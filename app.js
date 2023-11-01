const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const {v4: uuidV4 } = require('uuid')
const {ExpressPeerServer} = require('peer')


app.set('view engine', 'ejs')
app.use(express.static('public'))



app.get('/',(req,res)=>{
  res.redirect(`/${uuidV4()}`)
})


server.listen(3000)