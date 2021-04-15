/* jshint esversion: 6 */

const redis = require("redis");
const nconf = require('nconf');
nconf.argv().env().file({ file: __dirname + '/keys.json' });

// reference: https://cloud.google.com/community/tutorials/nodejs-redis-on-appengine#connecting_to_a_redis_server
const client = redis.createClient(6379, '127.0.0.1');

const prefixEnum = require("../enum/prefix");

module.exports = {

  // create an exam
  addExam: function (exam, host, callback) {
    client.sadd(prefixEnum.invigilators + exam.channel, host);
    client.hmset(prefixEnum.exam + exam.channel, exam, function (err, addedExam) {
      if (err) throw err;
      callback(addedExam);
    });
  },

  // get an exam
  getExam: function (channel, callback) {
    client.hgetall(prefixEnum.exam + channel, function (err, exam) {
      if (err) throw err;
      callback(exam);
    });
  },


  // update the agora token for an exam
  updateToken: function (channel, token, callback) {
    client.hset(prefixEnum.exam + channel, "token", token, function (err, updated) {
      if (err) throw err;
      callback(updated > -1);
    });
  },

  // remove an exam from the list
  removeExam: function (channel, callback) {
    client.del(prefixEnum.students + channel, function (err, res) { if (err) throw err; });
    client.del(prefixEnum.invigilators + channel, function (err, res) { if (err) throw err; });
    client.del(prefixEnum.exam + channel, function (err, response) {
      if (err) throw err;
      if (response == 1) return callback(true);
      return callback(false);
    });
  },

  // get all exams
  getAllExams: function (callback) {
    client.keys(prefixEnum.exam + "*", function (err, exams) {
      if (err) throw err;
      return callback(exams);
    });
  },

  // get all students in an exam
  getStudents: function (channel, callback) {
    client.smembers(prefixEnum.students + channel, function (err, students) {
      if (err) throw err;
      if (!students) return callback([]);
      callback(students);
    });
  },

  // get all invigilators in an exam
  getInvigilators: function (channel, callback) {
    client.smembers(prefixEnum.invigilators + channel, function (err, invigilators) {
      if (err) throw err;
      if (!invigilators) return callback([]);
      callback(invigilators);
    });
  },

  // add a student to the exam
  addStudents: function (channel, email, callback) {
    client.sadd(prefixEnum.students + channel, email, function (err, updated) {
      if (err) throw err;
      callback(updated);
    });
  },

  // add an inviglator to the exam (used for promote only)
  addInvigilators: function (channel, email, callback) {
    client.sadd(prefixEnum.invigilators + channel, email, function (err, updated) {
      if (err) throw err;
      callback(updated);
    });
  },

  // remove a student from exam
  removeStudents: function (channel, email, callback) {
    client.srem(prefixEnum.students + channel, email, function (err, updated) {
      if (err) throw err;
      callback(updated);
    });
  },

  // remove an invigilator from an exam
  removeInvigilators: function (channel, email, callback) {
    client.srem(prefixEnum.invigilators + channel, email, function (err, updated) {
      if (err) throw err;
      callback(updated);
    });
  },

  // check if a student is already in an exam
  containStudent: function (channel, email, callback) {
    client.sismember(prefixEnum.students + channel, email, function (err, is) {
      if (err) throw err;
      callback(is);
    });
  },

  // check if an invigilator is already in an exam
  containInvigilator: function (channel, email, callback) {
    client.sismember(prefixEnum.invigilators + channel, email, function (err, is) {
      if (err) throw err;
      callback(is);
    });
  }

};
