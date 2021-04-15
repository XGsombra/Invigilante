/* jshint esversion: 6 */

const redis = require("redis");
const nconf = require('nconf');
nconf.argv().env().file({ file: __dirname + '/keys.json' });

// reference: https://cloud.google.com/community/tutorials/nodejs-redis-on-appengine#connecting_to_a_redis_server
const client = redis.createClient(6379, '127.0.0.1');

const prefixEnum = require("../enum/prefix");


module.exports = {

    // Add authentication information for user, the hash is the key. Expires after 5 minutes. 
    createAuthenticationInfo: function (email, hash, callback) {
        client.set(prefixEnum.auth + hash, email, function (err, re) {
            // the token will expire in 5 minutes
            client.expire(prefixEnum.auth + hash, 300);
            if (err) return callback(false);
            callback(true);
        });
    },

    // disable an email from receiving email
    disableEmail: function (email, callback) {
        client.set(prefixEnum.authExpire + email, 1, function (err, re) {
            if (err) return callback(false);
            // disable sending email to the address for 5 minutes
            client.expire(prefixEnum.authExpire + email, 300, function (err, re) {
                if (err) return callback(false);
            });
        });
        return callback(true);
    },

    // Authenticate the user with the email corresponding to the hash. 
    authenticateEmail: function (hash, callback) {
        client.get(prefixEnum.auth + hash, function (err, email) {
            if (err) return callback(false);
            if (email == null) return callback(false);
            client.hset(prefixEnum.user + email, "activated", "true", function (err, re) {
                if (err) return callback(false);
                return callback(true);
            });
        });
    },

    // check if can send email to the address
    canSendEmail: function (email, callback) {
        client.get(prefixEnum.authExpire + email, function (err, result) {
            if (result == null) return callback(true);
            return callback(false);
        });
    }
};