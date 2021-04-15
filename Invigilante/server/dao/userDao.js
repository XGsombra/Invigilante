/* jshint esversion: 6 */

const redis = require("redis");
const nconf = require('nconf');
nconf.argv().env().file({ file: __dirname + '/keys.json' });

// reference: https://cloud.google.com/community/tutorials/nodejs-redis-on-appengine#connecting_to_a_redis_server
const client = redis.createClient(6379, '127.0.0.1');

const prefixEnum = require("../enum/prefix");


module.exports = {

  // find a user in database
  findUser: function (email, callback) {
    client.hget(prefixEnum.user + email, "email", function (err, email) {
      if (err) throw err;
      callback(email);
    });
  },

  // create a user
  createUser: function (user, callback) {
    this.findUser(user.email, function (email) {
      if (email != null) return callback(null);
      client.hmset(prefixEnum.user + user.email, user);
      callback(user);
    });
  },

  // get all information of a user
  getUser: function (email, callback) {
    client.hgetall(prefixEnum.user + email, function (err, user) {
      if (err) throw err;
      callback(user);
    });
  },

  // get the role of user
  getUserRole: function (email, callback) {
    client.hget(prefixEnum.user + email, "role", function (err, role) {
      if (err) throw err;
      callback(role);
    });
  },

  // set the IP address of a user
  setUserIP: function (email, ip, callback) {
    client.set(prefixEnum.ip + email, ip, function (err, added) {
      if (err) return callback(false);
      client.expire(prefixEnum.ip + email, 60 * 60 * 3, function (err, set) {
        if (err) return callback(false);
        return callback(true);
      });
    });
  },

  // get the IP address of a user
  getUserIP: function (email, callback) {
    client.get(prefixEnum.ip + email, function (err, ip) {
      if (!err) return callback(ip);
    });
  }

};