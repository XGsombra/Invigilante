/* jshint esversion: 6 */

const crypto = require('crypto');
const e = require('express');
const userDao = require("../dao/userDao");
const { user } = require('../enum/prefix');
const roleEnum = require("../enum/role");

function generateSalt() {
    return crypto.randomBytes(16).toString('base64');
}

function generateHash(password, salt) {
    var hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    return hash.digest('base64');
}

module.exports = {

    // create a User
    createUser: function (email, username, password, role, callback) {
        let salt = generateSalt();
        let saltedHash = generateHash(password, salt);
        let user = {};
        user.email = email;
        user.username = username;
        user.salt = salt;
        user.saltedHash = saltedHash;
        user.role = role;
        user.activated = "false";
        userDao.createUser(user, function (user) {
            serviceResult = {};
            if (user == null) {
                serviceResult.code = 400;
            } else {
                serviceResult.code = 200;
                serviceResult.user = user;
            }
            callback(serviceResult);
        });
    },

    // check if a user exists
    checkUserExist: function (email, callback) {
        userDao.findUser(email, function (result) {
            if (result == null) return callback(false);
            callback(true);
        });
    },

    // sign in a user, verify his/her password using the salted hash
    signInUser: function (email, password, callback) {
        userDao.getUser(email, function (result) {
            if (result == null) {
                callback(null);
            }
            callback(generateHash(password, result.salt) == result.saltedHash);
        });
    },

    // get all information of a user
    getUser: function (email, callback) {
        userDao.getUser(email, function (user) {
            if (user == null) return callback(null);
            return callback(user);
        });
    },

    // get the role of a user
    getUserRole: function (email, callback) {
        userDao.getUserRole(email, function (user) {
            if (user == null) return callback(null);
            return callback(Number(user));
        });
    },

    // set the ip address of the user
    setUserIp: function (email, ip, callback) {
        userDao.setUserIP(email, ip, callback);
    }

};