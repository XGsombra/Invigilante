/* jshint esversion: 6 */

const crypto = require('crypto');
const nodemailer = require("nodemailer");
const authenticateDao = require("../dao/authenticateDao");
const emailAuth = require("emailAuth.json");

let generateAuthHash = function (email) {
    let salt = crypto.randomBytes(16).toString('base64');
    let hash = crypto.createHmac('sha512', salt);
    hash.update(email + new Date());
    return hash.digest("base64");
};

function createAuthenticationInfo(email, callback) {
    let hash = generateAuthHash(email);
    authenticateDao.createAuthenticationInfo(email, hash, function (res) {
        if (res) return callback(hash);
        callback(hash);
    });
}

module.exports = {

    // send the authentication email to users
    sendAuthentication: function (email, callback) {

        // check if the user as sent an email within 5 minutes
        authenticateDao.canSendEmail(email, function (canSend) {
            if (!canSend) return callback("Please wait until you can send next email (less than 5 min)");

            // create the authentication link for user
            createAuthenticationInfo(email, function (hash) {
                if (!hash) return callback("Failed to send email");
                let transporter = nodemailer.createTransport({
                    host: "mail.gandi.net",
                    port: 465,
                    secure: true,
                    auth: {
                        user: emailAuth.user,
                        pass: emailAuth.pass
                    },
                });

                // encode hash value for URL purpose
                let link = "https://invigilante.website/api/user/authenticate?hash=" + encodeURIComponent(hash);
                transporter.sendMail({
                    from: '"Invigilante Service" <service@invigilante.website>',
                    to: email,
                    subject: "Email Verification",
                    text: "Please click the following link to verify your email: " + link
                });

                // disable the email after the email is sent
                authenticateDao.disableEmail(email, function (result) {
                    if (result) return callback("Email sent");
                    return callback("something went wrong :(");
                });
            });
        });
    },

    // authenticate the email and activate the account
    authenticateEmail: function (hash, callback) {
        authenticateDao.authenticateEmail(hash, callback);
    },
};