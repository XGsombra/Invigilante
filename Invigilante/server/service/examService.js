/* jshint esversion: 8 */

const examDao = require("../dao/examDao");

const userDao = require("../dao/userDao");
const { exam } = require("../enum/prefix");
const prefixEnum = require("../enum/prefix");

const crypto = require("crypto");

function generateSalt() {
    return crypto.randomBytes(16).toString('base64');
}

function generateHash(password, salt) {
    var hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    return hash.digest('base64');
}

module.exports = {

    // create an exam
    createExam: function (channel, passcode, host, callback) {
        let exam = {};
        exam.token = -1;
        exam.channel = channel;
        exam.host = host;
        exam.salt = generateSalt();
        exam.saltedHash = generateHash(passcode, exam.salt);
        examDao.getExam(exam.channel, function (examExisted) {
            // check if an exam already exists
            if (examExisted) return callback({ channel: -1 });
            examDao.addExam(exam, host, function (addedExam) {
                if (addedExam == "OK")
                    return callback({ channel: 1 });
                return callback({ channel: 0 });
            });
        });
    },

    // remove an exam
    removeExam: function (channel, callback) {
        examDao.getExam(channel, function (exam) {
            if (exam == null)
                return callback(null);
            examDao.removeExam(channel, function (removed) {
                callback(removed);
            });
        });
    },

    // delete all exams
    removeAllExams: function (callback) {
        examDao.getAllExams(function (exams) {
            exams.forEach(function (exam) {
                examDao.removeExam(exam, function (removed) {
                    if (!removed) return callback(removed);
                });
            });
        });
        callback(true);
    },

    // add agora token to an exam
    addExamToken: function (token, channel, callback) {
        examDao.getExam(channel, function (exam) {
            if (exam == null)
                return callback(null);
            examDao.updateToken(channel, token, callback);
        });
    },

    // get agora token of an exam
    getToken: function (channel, callback) {
        examDao.getExam(channel, function (exam) {
            if (exam == null)
                return callback(null);
            callback(exam.token);
        });
    },

    // get all students in an exam
    getStudents: function (channel, callback) {
        examDao.getExam(channel, function (exam) {
            if (exam == null)
                return callback(null);
            examDao.getStudents(channel, callback);
        });
    },

    // get invigilators of an exam
    getInvigilators: function (channel, callback) {
        examDao.getExam(channel, function (exam) {
            if (exam == null)
                return callback(null);
            examDao.getInvigilators(channel, callback);
        });
    },

    // add a student to an exam
    addStudentToExam: function (channel, email, callback) {
        // check if exam exists
        examDao.getExam(channel, function (exam) {
            if (exam == null)
                return callback(null);
            // check if student is already in exam
            userDao.findUser(email, function (user) {
                if (!user)
                    return callback(null);
                examDao.addStudents(channel, email, function (added) {
                    callback(true);
                });
            });
        });
    },

    // remove student from an exam
    removeStudentFromExam: function (channel, email, callback) {
        // check if exam exists
        examDao.getExam(channel, function (exam) {
            if (exam == null)
                return callback(null);
            // check if student exists
            userDao.findUser(email, function (user) {
                if (!user)
                    return callback(null);
                // check is student is already in the exam
                examDao.containStudent(channel, email, function (contain) {
                    if (!contain) return callback(false);
                    examDao.removeStudents(channel, email, function (removed) {
                        callback(true);
                    });
                });
            });
        });
    },

    // add invigilator to the exam (similar logic as addStudentToExam)
    addInvigilatorToExam: function (channel, email, callback) {
        examDao.getExam(channel, function (exam) {
            if (exam == null)
                return callback(null);
            userDao.findUser(email, function (user) {
                if (!user)
                    return callback(null);
                examDao.containInvigilator(channel, email, function (contain) {
                    if (contain) return callback(false);
                    examDao.addInvigilators(channel, email, function (added) {
                        callback(true);
                    });
                });
            });
        });
    },

    // remove invigilator from the exam (similar logic as removeStudentFromExam)
    removeInvigilatorFromExam: function (channel, email, callback) {
        examDao.getExam(channel, function (exam) {
            if (exam == null)
                return callback(null);
            userDao.findUser(email, function (user) {
                if (!user)
                    return callback(null);
                examDao.containInvigilator(channel, email, function (contain) {
                    if (!contain) return callback(false);
                    examDao.removeInvigilators(channel, email, function (removed) {
                        callback(true);
                    });
                });
            });
        });
    },

    // get all exams
    getAllExams: function (callback) {
        examDao.getAllExams(function (exams) {
            strippedExams = [];
            exams.forEach(function (exam) {
                strippedExams.unshift(prefixEnum.strip(prefixEnum.exam, exam));
            });
            callback(strippedExams);
        });
    },

    // check if the passcode user entered matches the actuall code of the exam
    validateExam: function (channel, passcode, callback) {
        examDao.getExam(channel, function (exam) {
            if (exam == null) return callback(null);
            let salt = exam.salt;
            let saltedHash = exam.saltedHash;
            return callback(generateHash(passcode, salt) == saltedHash);
        });
    },

    // check if an Admin is the host for the exam
    isHost: function (channel, email, callback) {
        examDao.getExam(channel, function (exam) {
            if (exam == null) return callback(null);
            callback(email == exam.host);
        });
    },

    // get the IP address of students
    getRepeatedIP: function (channel, callback) {
        examDao.getStudents(channel, async function (students) {
            repeatedIP = {};

            let lop = students.map((email) => {
                return new Promise(function (resolve) {
                    userDao.getUserIP(email, function (ip) {
                        if (!(ip in repeatedIP)) {
                            repeatedIP[ip] = [];
                        }
                        repeatedIP[ip].push(email);
                        return resolve();
                    });
                });
            });

            try {
                await Promise.all(lop);
            } catch (err) {
                console.log('err', err);
            }

            // console.log('final', repeatedIP);
            callback(repeatedIP);
        });
    }

};
