/* jshint esversion: 6 */

const express = require('express');
const bodyParser = require('body-parser');
const examController = express.Router();
const examService = require('../service/examService');
const agoraService = require('../service/agoraService');
const roleEnum = require("../enum/role");
const tool = require("./tool");
const userService = require("../service/userService");
const { exam } = require('../enum/prefix');
const faceService = require('../service/faceService');
const fs = require('fs');
const FileType = require('file-type');
const longpoll = require('express-longpoll')(examController);

examController.use(bodyParser.json());

longpoll.create('/exams-longpoll', tool.isAuthenticated, { maxListeners: 100 });
longpoll.create('/invigilators-longpoll/:id', function (req, res, next) {
    req.id = req.params.id;
    next();
}, { maxListeners: 100 });

// add an exam
examController.post("/", tool.isAuthenticated, tool.isAdmin, tool.checkChannel, function (req, res, next) {
    let channel = req.body.channel;
    let passcode = req.body.passcode;
    let host = req.session.email;
    if (!channel || !passcode) {
        return res.status(400).json({ message: "Bad input" });
    }
    examService.createExam(channel, passcode, host, function (addedExam) {
        if (!addedExam) return res.status(500).json({ message: "Failed to create exam" });
        if (addedExam.channel == -1) return res.status(409).json({ message: "The exam with this token already exists" });

        // update the exam list on client side by long polling
        examService.getAllExams(function (exams) {
            longpoll.publish('/exams-longpoll', exams);
            return res.status(200).json({ message: "Exam created" });
        });
    });
});

// remove an exam
examController.delete("/:channel", tool.isAuthenticated, tool.isAdmin, function (req, res, next) {
    let channel = req.params.channel;
    if (!channel) {
        return res.status(400).json({ message: "Bad input" });
    }
    examService.removeExam(channel, function (removed) {
        if (removed == null) return res.status(404).json({ message: "This exam does not exist" });
        if (!removed) return res.status(500).json({ message: "Failed to remove exam" });

        // update the exam list on client side by long polling
        examService.getAllExams(function (exams) {
            longpoll.publish('/exams-longpoll', exams);
            return res.status(200).json({ message: "Removed exam" });
        });
    });
});

// get all student's email in this exam
examController.get("/:channel/students", tool.isAuthenticated, tool.isAdmin, function (req, res, next) {
    let channel = req.params.channel;
    if (!channel) {
        return res.status(400).json({ message: "Bad input" });
    }
    // check if the admin is the host of the exam
    examService.isHost(channel, req.session.email, function (host) {
        if (!host) return res.status(403).json({ message: "Access denied" });
        examService.getStudents(channel, function (students) {
            if (students == null) return res.status(404).json({ message: "This exam does not exist" });
            return res.status(200).json({ students: students });
        });
    });
});

// get all invigilator's email in this exam
examController.get("/:channel/invigilators", tool.isAuthenticated, function (req, res, next) {
    let channel = req.params.channel;
    if (!channel) {
        return res.status(400).json({ message: "Bad input" });
    }
    examService.getInvigilators(channel, function (invigilators) {
        if (invigilators == null) return res.status(404).json({ message: "This exam does not exist" });
        return res.status(200).json({ invigilators: invigilators });
    });
});

// enter the waiting room by entering the correct passcode
examController.post("/:channel/verify", tool.isAuthenticated, function (req, res, next) {
    let channel = req.params.channel;
    let passcode = req.body.passcode;
    if (!channel || !passcode) {
        return res.status(400).json({ message: "Bad input" });
    }

    // verify the passcode
    examService.validateExam(channel, passcode, function (validated) {
        if (validated == null) return res.status(404).json({ message: "This exam does not exist" });
        if (!validated) return res.status(403).json({ message: "Wrong passcode for the exam" });
        examService.isHost(channel, req.session.email, function (ishost) {

            if (ishost) {
                // if is the host of the exam, then enter the exam
                req.session.personGroupId = channel;
                return res.status(200).json({ message: "Correct passcode" });
            } else {
                // the student enters, get its IP address
                userService.setUserIp(req.session.email, req.ip, function (setIP) {
                    if (!setIP) res.status(400).json({ message: "Cannot get IP address of user" });
                    // give students the agora token
                    examService.getToken(channel, function (token) {
                        if (token === '-1') return res.status(404).json({ message: "The exam has not started" });
                        req.session.personGroupId = channel;
                        return res.status(200).json({ message: "Correct passcode" });
                    });
                });
            }
        });
    });
});

// enter/exit exam as student
examController.put("/:channel/students/:action", tool.isAuthenticated, function (req, res, next) {
    let channel = req.params.channel;
    let email = req.session.email;
    let action = req.params.action;
    if (!channel || !email || (action !== "enter" && action !== "exit")) {
        return res.status(400).json({ message: "Bad input" });
    }
    if (action === "enter") {
        // the students enter the exam if is not already in the exam
        examService.addStudentToExam(channel, email, function (result) {
            if (!result) return res.status(409).json({ message: "This student has already entered the exam" });
            examService.getToken(channel, function (token) {
                if (token === '-1') return res.status(404).json({ message: "The exam has not started" });
                agoraService.generateToken(channel, email, function (agoraSpec) {
                    req.session.personGroupId = channel;
                    return res.status(200).json(agoraSpec);
                });
            });
        });
    }
    if (action === "exit") {
        // the students exst the exam if is in the exam
        examService.removeStudentFromExam(channel, email, function (result) {
            if (result == null) return res.status(404).json({ message: "This exam does not exist" });
            if (!result) return res.status(404).json({ message: "This student is not in the exam" });
            return res.status(200).json({ message: "Student left the exam" });
        });
    }
});

// exit exam as invigilator
examController.put("/:channel/invigilators", tool.isAuthenticated, tool.isAdmin, function (req, res, next) {
    let channel = req.params.channel;
    let email = req.session.email;
    if (!channel || !email) {
        return res.status(400).json({ message: "Bad input" });
    }
    examService.removeInvigilatorFromExam(channel, email, function (result) {
        if (result == null) return res.status(404).json({ message: "This exam does not exist" });
        if (!result) return res.status(404).json({ message: "This invigilator is not in the exam" });
        return res.status(200).json({ message: "Invigilator left the exam" });
    });
});

// promote student to be invigilator
examController.put("/:channel/promote", tool.isAuthenticated, tool.isAdmin, function (req, res, next) {
    let channel = req.params.channel;
    let email = req.body.email;
    if (!channel || !email) {
        return res.status(400).json({ message: "Bad input" });
    }
    examService.isHost(channel, req.session.email, function (host) {
        if (!host) return res.status(403).json({ message: "Access denied" });
        // remove user from the student list
        examService.removeStudentFromExam(channel, email, function (resultRemove) {
            if (resultRemove == null) return res.status(404).json({ message: "This exam does not exist" });
            // add the user to the invigilator list
            examService.addInvigilatorToExam(channel, email, function (resultAdd) {
                if (resultAdd == null) return res.status(404).json({ message: "This exam does not exist" });
                // update student and invigilator list by long polling
                examService.getInvigilators(channel, function (invigilators) {
                    invigilators.forEach(user => {
                        longpoll.publishToId('/invigilators-longpoll/:id', channel + '(' + user + ')', { invigilators: invigilators });
                    });
                    examService.getStudents(channel, function (students) {
                        students.forEach(user => {
                            longpoll.publishToId('/invigilators-longpoll/:id', channel + '(' + user + ')', { invigilators: invigilators });
                        });
                    });
                    return res.status(200).json({ message: "Promoted student to invigilator" });
                });
            });
        });
    });
});

// get all exams
examController.get("/exams", tool.isAuthenticated, function (req, res, next) {
    examService.getAllExams(function (exams) {
        return res.status(200).json(exams);
    });
});

// set exam agora token
examController.put("/:channel", tool.isAuthenticated, tool.isAdmin, function (req, res, next) {
    const channel = req.params.channel;
    const email = req.session.email;
    if (!channel) return res.status(400).json({ message: "Bad input" });
    // check if the admin is the host for the exam
    examService.isHost(channel, req.session.email, function (host) {
        if (!host) return res.status(403).json({ message: "Access denied" });
        // generate a token
        agoraService.generateToken(channel, email, function (agoraSpec) {
            token = agoraSpec.token;
            examService.addExamToken(token, channel, function (result) {
                if (result == null) return res.status(404).json({ message: "This exam does not exist" });
                if (!result) return res.status(500).json({ message: "Failed to update token" });
                return res.status(200).json(agoraSpec);
            });
        });
    });
});

// get students with same IP address
examController.get("/repeatedip/:channel", function (req, res, next) {
    let channel = req.params.channel;
    if (!channel) return res.status(400).json({ message: "Bad input" });
    // check the exam exists
    examService.getAllExams(function (exams) {
        if (!exams.includes(channel)) return res.status(404).json({ message: "Exam does not exist" });
        examService.getRepeatedIP(channel, function (repeatedIP) {
            return res.status(200).json({ repeatedIP });
        });
    });
});

// send the id photo of the student to the invigilator
examController.get("/id/:email", function (req, res, next) {
    let email = req.params.email;
    if (!email) return res.status(400).json({ message: "Bad input" });
    examService.getStudents(req.session.personGroupId, function (students) {
        if (!students.includes(email)) return res.status(404).json({ message: "User not in the exam" });
        faceService.getIdFilePath(email, function (filepath) {
            if (!filepath) return res.status(404).json({ message: "User ID does not exist" });
            FileType.fromFile(filepath).then(
                function (fromFile) {
                    res.setHeader('Content-Type', fromFile.mime);
                    res.sendFile(filepath);
                }
            );
        });
    });
});


module.exports = examController;
