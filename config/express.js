const express = require('express')
const bodyParser = require('body-parser')

const app = express()

app.use(express.json())

app.use(express.static('./public'))
app.use('/css', express.static('./node_modules/bootstrap/dist/css'))

app.use('/js/lib', express.static('./node_modules/angular'))
app.use('/js/lib', express.static('./node_modules/angular-route'))

app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json())

module.exports = app