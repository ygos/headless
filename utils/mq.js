/*
 * Mq 消息队列
 * 用于实现下面的目标：
 * 1. 实现最基本的生产与消费功能
 * 2. 根据业务需要，可定制任务的优先级，队列消费速度等
 * 3. 可实现分布式部署，水平扩展，动态调整消费者资源
 * 4. 支持亿级业务量
 * 作者：菁武
 **/

const os = require('os');
const util = require('util');
const config = require('config');
const process = require('process');
const mongo = require('../utils/mongo');
const redis = require('../utils/redis');
process.title='headless-0';

var mqkey_id = config.get('mqkey_id');
var mqkey_batch = config.get('mqkey_batch');
statsDefault = {"undo": 0, "ready": 0, "doing": 0, "done": 0, "end": 0, "total": 0}

// 获取进程名
function get_proc_title() {
    return process.title + "::::hostname:" + os.hostname();
}

// 生产者
module.exports.produce = async function (mqkey, items) {
    var undokey = util.format('mq_%s_undo', mqkey);
    for(let i in items) {
        await mongo.findOneAndUpdate(undokey, {mqkey_id:items[i][mqkey_id]}, {'$set':items[i]}, {upsert:true});
    }
    await mongo.findOneAndUpdate('stats_mq', {'mq_key':mqkey}, {"$inc":{"undo":items.length}}, null)
    var stats = {}
    var batchNo;
    for(var i in items) {
        batchNo = items[i][mqkey_batch];
        if(!stats.hasOwnProperty(batchNo)) stats[batchNo] = 0;
        stats[batchNo] += 1
    }
    async function execTmp() {
        for(var batch in stats) {
            await mongo.findOne('stats_batch_stage', {"mqkey": mqkey, 'batch':batch})
            .then(function(doc) {
                if(doc == null) {
                    mongo.findAndModify('stats_batch_stage', {"mqkey": mqkey, 'batch': batch}, {"$set":statsDefault}, {upsert:true});
                }
                mongo.findAndModify('stats_batch_stage', {"mqkey": mqkey, 'batch': batch}, {"$inc":{"undo":stats[batch], "total":stats[batch]}});
            });
        }
    }
    execTmp();
}

//添加准备执行的任务
module.exports.ready = async function(mqkey = '') {
    if(mqkey == '') return false;
    var undoKey = util.format('mq_%s_undo', mqkey);
    var readyKey = util.format('mq_%s_ready', mqkey);
    var readyKeyRedis = util.format('mq_%s_ready', mqkey);

    redis.llen(readyKeyRedis)
    .then(total => {
        if(total >= config.get(mqkey+'.ready_total')) {
            return new Promise((resolve, reject) => {
                reject('the redis is full');
            });
        }
        var readyLackLen = config.get(mqkey + '.ready_total') - total;
        return mongo.find(undoKey, {}, {"_id":0, sort:[[mqkey_batch, 1], [mqkey_id, 1]], limit:readyLackLen});
    })
    .then(async function (docs) {
        var batchNo;
        var stats = {};
        var readySupplyLen = 0;
        for(var i in docs) {
            batchNo = docs[i][mqkey_batch];
            await redis.rpush(readyKeyRedis, JSON.stringify(docs[i]));
            await mongo.findAndModify(readyKey, {mqkey_id:docs[i][mqkey_id]}, {'$set': docs[i]}, {upsert:true});
            await mongo.deleteMany(undoKey, {mqkey_id:docs[i][mqkey_id]});
            if(!stats.hasOwnProperty(batchNo)) stats[batchNo] = 0
            stats[batchNo] = stats[batchNo] + 1
            readySupplyLen = readySupplyLen + 1
        }
        for(var batch in stats) {
            await mongo.findAndModify('stats_batch_stage', {"mqkey": mqkey, 'batch': batch}, {"$inc":{"undo":-stats[batch], "ready":stats[batch]}})
        }
    })
    //.catch(err => {
    //    return new Promise((resolve, reject) => { reject(err); });
    //});
}

module.exports.consume = function(mqkey = '') {
    //消费任务
    if(mqkey == '') {
        return new Promise((resolve, reject) => { reject('mqkey is empty'); });
    }
    var readyKey = util.format('mq_%s_ready', mqkey);
    var doingKey = util.format('mq_%s_doing', mqkey);
    var readyKeyRedis = util.format('mq_%s_ready', mqkey);
    return redis.lpop(readyKeyRedis)
    .then(doc => {
        if(doc == null) {
            return new Promise((resolve, reject) => { reject('the redis is empty'); });
        }
        var item = JSON.parse(doc);
        mongo.findOne('stats_batch_run', {'mqkey': mqkey, 'batch': item[mqkey_batch]})
        .then(async function(doc) {
            if(doc == null) 
            await mongo.insertOne('stats_batch_run', {"mqkey": mqkey, "batch": item[mqkey_batch], "is_end": 0, "start_at": Math.floor(Date.now()/1000), "end_at": ""});
        });
        return new Promise((resolve, reject) => { resolve(item); });
    })
    .then(item => {
        var title = get_proc_title()
        mongo.findAndModify('process_list', {'hostname': os.hostname(), 'title':title.substr(7)}, {'$set':{mqkey_id:item[mqkey_id]}})
        mongo.findAndModify(doingKey, {mqkey_id:item[mqkey_id]}, {'$set': item}, {upsert:true})
        mongo.deleteMany(readyKey, {mqkey_id:item[mqkey_id]})
        mongo.findAndModify('stats_mq', {'mq_key':mqkey}, {"$inc":{"ready":-1, "doing":1}})
        mongo.findAndModify('stats_batch_stage', {"mqkey":mqkey, 'batch':item[mqkey_batch]}, {"$inc":{"ready":-1, "doing":1}})
        return new Promise((resolve, reject) => {
            resolve(item);
        });
    })
    //.catch(err => {
    //    return new Promise((resolve, reject) => { reject(err); });
    //});
}

//结束任务
module.exports.finish = function(mqkey = '', mqid) {
    if(mqkey == '') return false;
    var doneKey = util.format('mq_%s_done', mqkey);
    var doingKey = util.format('mq_%s_doing', mqkey);
    return mongo.findOne(doingKey, {mqkey_id:mqid})
    .then(doing => {
        if(doing == null) {
            return new Promise((resolve, reject) => { reject('data is not exists'); });
        } else {
            return new Promise((resolve, reject) => { resolve(doing); });
        }
    }).then(async function(doing) {
        await mongo.deleteMany(doingKey, {mqkey_id:mqid})
        await mongo.findAndModify(doneKey, {mqkey_id:doing[mqkey_id]}, {'$set': doing}, {upsert:true});
        await mongo.findAndModify('stats_mq', {'mq_key':mqkey}, {"$inc":{"doing":-1, "done":1}})
        await mongo.findAndModify('stats_batch_stage', {"mqkey": mqkey, 'batch':doing[mqkey_batch]}, {"$inc":{"doing":-1,"done":1}});
    })
    //.catch(err => {
    //        return new Promise((resolve, reject) => { reject('data is not exists'); });
    //});
}

//获取运行状态
module.exports.get_stats_batch = async function(mqkey, batch) {
    return  await mongo.findOne('stats_batch_stage', {'mqkey':mqkey, 'batch':batch}, {"_id":0});
}

