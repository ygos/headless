var config = require('./config/config.json')
var express = require('express')
var app = express()
var mongo = require('./utils/mongo')
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

function api_index(req, res) {
    res.send('hello world, jingwu!')
}

async function task_save(req, res) {
    var doc = {
    //    "id":0,
        "appkey": req.body.appkey,
        "task_type": req.body.task_type,
        "params": req.body.params,
        "notify_url": req.body.notify_url,
    }
    var docs = []
    docs.push(doc)
    docs.push(doc)
    docs.push(doc)
    //var id = await mongo.insertWithId('task', doc)
    var ids = await mongo.insertManyWithId('task', docs)
    console.log(ids)
    res.send('task save!')
}

app.get('/', api_index)

app.post('/task/save', task_save)

console.log("connecting to " + config['api-port'])
app.listen(config['api-port'])

