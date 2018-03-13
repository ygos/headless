const config = require('config');
const mongo = require('./utils/mongo');
const mq = require('./utils/mq');
const log = require('./utils/log');
const redis = require('./utils/redis');
const eve = require('./browser/event');


//mongo.find('mq_event_undo')
//.then(function(docs){
//    console.log(docs);
//});

//mongo.findOneAndUpdate('mq_event_undo', {mq_id: 1}, {'$set':{'name': 'tester fineOneAndUpdate'}})
//.then(function(result) {
//    console.log(result);
//});

//mongo.find('undo', {}, function(err, docs) {});
//var inserter = {mq_id:1, mq_batch:"event_1",name:"tester js event"}
//mongo.insert('undo', inserter, function(err, docs) {
//    console.log(docs);
//});

//var items = [];
//for(var i = 1; i <= 2000; i++) {
//    items.push({mq_id:i, mq_batch: 'event_1', name:"tester event " + i});
//}
//mq.produce('event', items);

//mq.ready('event');

//mq.consume('event').then(function(doc) {
//    console.log(doc);
//}).catch(err => {
//    console.log(err);
//});

//mq.finish('event', 4);

//result = eve.parseEvent('http://www.ifeng.com');
//console.log(result);

mongo.getAutoid('jingwu', 5)
.then(function(docs){
    console.log(docs)
})
