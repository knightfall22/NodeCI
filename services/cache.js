const keys = require('../config/keys')

const mongoose = require('mongoose');
const {promisify} = require('util')

const exec = mongoose.Query.prototype.exec;
const redis = require('redis')
const client = redis.createClient(keys.redisUrl)

client.hget = promisify(client.hget)

mongoose.Query.prototype.cache = function(options = {}) { 
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || 'default');

    return this;
}

mongoose.Query.prototype.exec = async function() {

    if (!this.useCache) {
        return exec.apply(this, arguments);
    }

    const key = JSON.stringify({...this.getQuery(), collection: this.mongooseCollection.name});
    console.log(key)
    const cacheValue = await client.hget(this.hashKey,key);

    if (cacheValue) {
        const doc = JSON.parse(cacheValue);
        
        return Array.isArray(doc) ? 
            doc.map(doc => new this.model(doc)) : 
            new this.model(doc);
        
         
    }

    const result = await exec.apply(this, arguments);
    client.hset(this.hashKey,key, JSON.stringify(result))
    
    return result;
}


module.exports = {
    clearHash (hashKey) {
        client.del(JSON.stringify(hashKey))
    }
}