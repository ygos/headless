var config = require('config');
const MongoClient = require('mongodb').MongoClient;

function openDB() {
    return MongoClient.connect(config.get('mongo_url'), {poolSize: 5});
}

function openDoc(client, docName) {
    return new Promise(function(resolve, reject) {
        return client.db(config.get('mq_db'))
            .collection(
                docName, 
                function(err, collection) {
                    if(err) {
                        client.close();
                        return reject(err);
                    } else {
                        return resolve(collection);
                    }
                }
            );
    });
};

function find(docName, query = {}, options = {}) {
    return openDB()
        .then(function(client) { return openDoc(client, docName); })
        .then(function(collection) { return collection.find(query, options).toArray(); });
}


function findOne(docName, query = {}, options = {}) {
    return openDB()
        .then(function(client) { return openDoc(client, docName); })
        .then(function(collection) { return collection.findOne(query, options); });
}

function findOneAndUpdate(docName, filter = {}, update = {}, options = {}) {
    return openDB()
        .then(function(client) { return openDoc(client, docName); })
        .then(function(collection) { return collection.findOneAndUpdate(filter, update, options); });
}

function findAndModify(docName, query = {}, doc = {}, options = {}) {
    return openDB()
        .then(function(client) { return openDoc(client, docName); })
        .then(function(collection) { return collection.findAndModify(query, [['_id','asc']], doc, options); });
}

function deleteMany(docName, filter = {}, options = {}) {
    return openDB()
        .then(function(client) { return openDoc(client, docName); })
        .then(function(collection) { return collection.deleteMany(filter, options); });
}

function insertOne(docName, doc = {}, options = {}) {
    return openDB()
        .then(function(client) { return openDoc(client, docName); })
        .then(function(collection) { return collection.insertOne(doc, options); });
}

async function getAutoid(docName, step=1) {
    if(step < 1) return false
    var result = await findOne('autoids', {"name":docName})
    if(result == null) await insertOne('autoids', {"name":docName, "id":0})
    var result = await findAndModify('autoids', {"name":docName}, {"$inc":{'id':step}})
    var currentId = result['value']['id']
    var ids = []
    for(var i = 1; i <= step; i++) ids.push(currentId + i)
    return ids
}

function insertMany(docName, docs = {}, options = {}) {
    return openDB()
        .then(function(client) { return openDoc(client, docName); })
        .then(function(collection) { return collection.insertMany(docs, options); });
}

async function insertWithId(docName, doc, options = {}) {
    var ids = await getAutoid(docName)
    for(var i in ids) {
        doc.id = ids[i]
        await insertOne(docName, doc)
    }
    return ids[0]
}

async function insertManyWithId(docName, doces, options = {}) {
    var docs = JSON.parse(JSON.stringify(doces))
    var step = docs.length
    var ids = await getAutoid(docName, step)
    for(let t = 0; t < step; t++) {
        docs[t].id = ids[t]
    }
    await insertMany(docName, docs)
    return ids
}

function close() {
    return openDB()
        .then(function(client) { client.close(); })
}

module.exports.close = close
module.exports.getAutoid = getAutoid

module.exports.find = find
module.exports.findOne = findOne
module.exports.findAndModify = findAndModify
module.exports.findOneAndUpdate = findOneAndUpdate

module.exports.deleteMany = deleteMany

module.exports.insertOne = insertOne
module.exports.insertMany = insertMany
module.exports.insertWithId = insertWithId
module.exports.insertManyWithId = insertManyWithId

