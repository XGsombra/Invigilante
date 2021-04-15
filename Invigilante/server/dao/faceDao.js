/* jshint esversion: 6 */

const redis = require("redis");
const nconf = require('nconf');
nconf.argv().env().file({ file: __dirname + '/keys.json' });

// reference: https://cloud.google.com/community/tutorials/nodejs-redis-on-appengine#connecting_to_a_redis_server
const client = redis.createClient(6379, '127.0.0.1');

const prefixEnum = require("../enum/prefix");

module.exports = {

  // add the image of user to the database
  addImage: function (image, callback) {
    client.hmset(prefixEnum.user + image.email, image, function (err, added) {
      if (err) {
        return callback(null);
      }
      callback(added);
    });
  },

  // add the personGroupPersonId to the database
  addPersonId: function (email, personId, callback) {
    client.set(prefixEnum.personId + email, personId, function (err, result) {
      if (err) return callback(null);
      return callback({ personId: personId });
    });
  },

  // get the personGroupPersonId of the student with corresponding email
  getPersonId: function (email, callback) {
    client.get(prefixEnum.personId + email, function (err, result) {
      if (err) return callback(null);
      return callback(result);
    });
  },

  // set the path to the ID file of student with corresponding email
  setStudentIdFilePath: function (email, filepath, callback) {
    client.set(prefixEnum.id + email, filepath, function (err, success) {
      if (err) throw err;
      callback(success);
    });
  },

  // get the path to the ID file of student with corresponding email
  getStudentIdFilePath: function (email, callback) {
    client.get(prefixEnum.id + email, function (err, filepath) {
      if (err) throw err;
      callback(filepath);
    });
  }

};