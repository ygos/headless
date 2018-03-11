var Redis = require('ioredis');
var redis = new Redis();

//var redis = require("redis"),
//client = redis.createClient();

// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /* ... */ });

//client.on("error", function (err) { console.log("Error " + err); });

//client.set("string key", "string val", redis.print);
//client.hset("hash key", "hashtest 1", "some value", redis.print);
//client.hset(["hash key", "hashtest 2", "some other value"], redis.print);

//module.exports.client = function(msg) { log.trace(msg); }
//module.exports = client;
//module.exports.print = redis.print;

module.exports = redis;
