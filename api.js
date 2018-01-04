var config = require('./config/config.json')
var express = require('express')
var app = express()
console.log(config['api-port'])

function api_index(req, res) {
  res.send('hello world, jingwu!')
}

// respond with "hello world" when a GET request is made to the homepage
app.get('/', api_index)

app.listen(config['api-port'])

