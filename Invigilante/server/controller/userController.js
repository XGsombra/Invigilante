/* jshint esversion: 6 */

const express = require('express');
const bodyParser = require('body-parser');
const cookie = require('cookie');
const userController = express.Router();
const userService = require('../service/userService');
const authenticateService = require("../service/authenticateService");
const roleEnum = require("../enum/role");
const tool = require("./tool");

userController.use(bodyParser.json());

// send authentication email
userController.put("/authenticate/", tool.isAuthenticatedWithoutVerify, function (req, res, next) {
    let email = req.session.email;
    if (!email) {
        return res.status(400).json({ message: "No current user" });
    }
    userService.checkUserExist(email, function (exists) {
        if (!exists) return res.status(404).json({ message: "User does not exist" });
        authenticateService.sendAuthentication(email, function (result) {
            if (result) return res.status(200).json({ message: result });
            return res.status(400).json({ message: "The email was not sent." });
        });
    });
});

// authenticate the email
userController.get("/authenticate/", function (req, res, next) {
    let hash = req.query.hash;
    hash = decodeURIComponent(hash);
    authenticateService.authenticateEmail(hash, function (result) {
        if (result) {
            req.session.verified = true;
            return res.status(200).json({ message: "Email address verified" });
        }
        return res.status(400).json({ message: "This authentication has been used or expired" });
    });
});

// sign up a user, check if the username is valid
userController.post("/signup", tool.checkUsername, function (req, res, next) {
    let email = req.body.email;
    let username = req.body.username;
    let password = req.body.password;
    let role = req.body.role;
    if (!email || !username || !password || (role != roleEnum.admin && role != roleEnum.student)) {
        return res.status(400).json({ message: "Bad input" });
    }
    userService.createUser(email, username, password, role, function (serviceResult) {
        if (serviceResult.code == 400) return res.status(409).json({ message: "This email is already used" });
        if (serviceResult.code == 200) {
            req.session.email = email;
            req.session.role = role;
            res.cookie("email", email);
            res.cookie("name", username);
            res.cookie("role", role);
            return res.status(200).json({ message: "Successfully signed up user" });
        }
    });
});

// sign in a user
userController.post("/signin", function (req, res, next) {
    let email = req.body.email;
    let password = req.body.password;
    if (!email || !password) {
        return res.status(400).json({ message: "Bad input" });
    }
    // check is a valid user
    userService.checkUserExist(email, function (exist) {
        if (!exist) return res.status(404).json({ message: "This email address doesn't exist" });
        userService.signInUser(email, password, function (result) {
            if (result == null) return res.status(404).json({ message: "User does not exist" });
            if (!result) return res.status(401).json({ message: "Wrong password" });
            req.session.email = email;
            userService.getUser(email, function (user) {
                if (user == null) return res.status(404).json({ message: "This email address doesn't exist" });
                // set the session information and cookie once password verified
                if (user.activated == "true") req.session.verified = true;
                const role = Number(user.role);
                req.session.role = role;
                req.session.username = user.username;
                res.cookie("email", email);
                res.cookie("role", role);
                res.cookie("name", user.username);
                return res.status(200).json({ message: "Successfully logged in" });
            });
        });
    });
});

userController.get('/signout/', function (req, res, next) {
    req.session.destroy();

    res.cookie("email", "");
    res.cookie("name", "");
    res.cookie("role", -1);
    return res.status(200).json({ message: "Successfully signed out" });
    // res.redirect('/welcome');
});

// get the status of user (signedin or not)
userController.get("/signedin", function (req, res, next) {
    if (req.session.email) return res.status(200).json({ signedin: 1 });
    return res.status(200).json({ signedin: 0 });
});

// get the username of a user
userController.get("/username/:email", tool.isAuthenticated, function (req, res, next) {
    let email = req.params.email;
    if (!email) return res.status(400).json({ message: "Bad Input" });
    userService.getUser(email, function (user) {
        if (!user) return res.status(404).json({ message: "User with this email does not exist" });
        return res.status(200).json({ username: user.username });
    });
});

// check if a user has his/her email address verified
userController.get("/verified", tool.isAuthenticatedWithoutVerify, function (req, res, next) {
    let email = req.session.email;
    userService.getUser(email, function (user) {
        if (!user) return res.status(404).json({ message: "User with this email does not exist" });
        req.session.verified = user.activated;
        return res.status(200).json({ verified: user.activated });
    });
});

module.exports = userController;
