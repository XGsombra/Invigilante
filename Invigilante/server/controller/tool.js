/* jshint esversion: 6 */

const validator = require('validator');
const roleEnum = require('../enum/role');

module.exports = {

    // return true if the user signed in and has his/her email validated, false otherwise
    isAuthenticated: function (req, res, next) {
        if (!req.session.email) return res.status(401).json({ message: "access denied" });
        if (!req.session.verified || req.session.verified !== 'true') return res.status(401).json({ message: "Please verify your email first" });
        next();
    },

    // return true if the user is an admin, false otherwise
    isAdmin: function (req, res, next) {
        if (req.session.role !== roleEnum.admin) return res.status(401).json({ message: "Access denied for inappropriate role" });
        next();
    },

    isVerified: function (req, res, next) {
        if (!req.session.verified) return res.status(401).json({ message: "Please verify your email first" });
        next();
    },

    // check if the username is sanitized
    checkUsername: function (req, res, next) {
        if (!req.body.username) return res.status(400).json({ message: "Please enter valid username" });
        if (!validator.isAlphanumeric(req.body.username)) return res.status(400).json({ message: "Invalid Username" });
        next();
    },

    // check if the channel name is sanitized
    checkChannel: function (req, res, next) {
        if (!req.body.channel) return res.status(400).json({ message: "Please enter valid channel" });
        if (!validator.isAlphanumeric(req.body.channel)) return res.status(400).json({ message: "Invalid Channel" });
        next();
    },

    // check if the user is signed in but the email is not verified yet
    isAuthenticatedWithoutVerify(req, res, next) {
        if (!req.session.email) return res.status(401).json({ message: "access denied" });
        next();
    },
};
