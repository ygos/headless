var config = require('config');
const MongoClient = require('mongodb').MongoClient;

var openDB = function() {
    return MongoClient.connect(config.get('mongo_url'), {poolSize: 5});
};

var openDoc = function(client, docName) {
    return new Promise(function(resolve, reject) {
        return client.db(config.get('mq_db'))
            .collection(
                docName, 
                function(err, collection) {
                    if (err) {
                        client.close();
                        return reject(err);
                    } else {
                        return resolve(collection);
                    }
                }
            );
    });
};

module.exports.close = function() {
    return openDB()
        .then(function(client) { client.close(); })
}

module.exports.find = function(docName, query = {}, options = {}) {
    return openDB()
        .then(function(client) { return openDoc(client, docName); })
        .then(function(collection) { return collection.find(query, options).toArray(); });
}

module.exports.findOne = function(docName, query = {}, options = {}) {
    return openDB()
        .then(function(client) { return openDoc(client, docName); })
        .then(function(collection) { return collection.findOne(query, options); });
}

module.exports.findOneAndUpdate = function(docName, filter = {}, update = {}, options = {}) {
    return openDB()
        .then(function(client) { return openDoc(client, docName); })
        .then(function(collection) { return collection.findOneAndUpdate(filter, update, options); });
}

module.exports.findAndModify = function(docName, query = {}, doc = {}, options = {}) {
    return openDB()
        .then(function(client) { return openDoc(client, docName); })
        .then(function(collection) { return collection.findAndModify(query, [['_id','asc']], doc, options); });
}

module.exports.deleteMany = function(docName, filter = {}, options = {}) {
    return openDB()
        .then(function(client) { return openDoc(client, docName); })
        .then(function(collection) { return collection.deleteMany(filter, options); });
}

module.exports.insertOne = function(docName, doc = {}, options = {}) {
    return openDB()
        .then(function(client) { return openDoc(client, docName); })
        .then(function(collection) { return collection.insertOne(doc, options); });
}

module.exports.insertMany = function(docName, docs = {}, options = {}) {
    return openDB()
        .then(function(client) { return openDoc(client, docName); })
        .then(function(collection) { return collection.insertMany(docs, options); });
}

