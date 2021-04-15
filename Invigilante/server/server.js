/* jshint esversion: 6 */

require('dotenv').config(); // environment configuration from .env will be loaded into process.env
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const faceService = require("./service/faceService");
const session = require("express-session");
const app = express();
const path = require('path');

app.set('trust proxy', true)

//middlewares
app.use(bodyParser.json());

app.use(session({
    secret: 'Otra ves',
    resave: false,
    saveUninitialized: true,
    //cookie: { httpOnly: true, sameSite: true }
}));

app.use(function (req, res, next) {
    console.log("HTTP request", req.session.email, req.method, req.url, req.body);
    next();
});

// reference: https://stackoverflow.com/questions/36002493/no-access-control-allow-origin-header-in-angular-2-app
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'https://localhost:4200');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

const environment = process.env.NODE_ENV;
if (environment == null) {
    throw new Error("app environemnt is not set. Expected: \"production\" or \"development\"");
}


//controllers
const userController = require('./controller/userController');
const faceController = require('./controller/faceController');
const examController = require('./controller/examController');
app.use("/api/user", userController);
app.use("/api/face", faceController);
app.use("/api/exam", examController);

// initialization
faceService.initializeFaceResources();

if (environment == 'production') {
    //    session.cookie.secure = true;
    app.use('/', express.static('dist/frontend', { redirect: false }));
    app.use('*', function (req, res, next) {
        res.sendFile(path.resolve('dist/frontend/index.html'));
    });
}

// start the server
const http = require('http');
const PORT = 3000;

http.createServer(/*config,*/ app).listen(PORT, function (err) {
    if (err) console.log(err);
    else {
        console.log("HTTP server on https://localhost:%s", PORT);
    }
});
