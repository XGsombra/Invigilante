/* jshint esversion: 8 */

const fs = require("fs");
const axios = require("axios");
const path = require("path");
const faceDao = require("../dao/faceDao");
const faceRecourseDir = "../resources/Face/Images/";

// Credits: This face service uses face analysis api from Microsoft Azure:
// https://docs.microsoft.com/en-us/azure/cognitive-services/face/quickstarts/client-libraries?pivots=programming-language-javascript&tabs=visual-studio
// Following are from the document on the official website. 
const msRest = require("@azure/ms-rest-js");
const Face = require("@azure/cognitiveservices-face");
const uuid = require("uuid/v4");

const nconf = require('nconf');
nconf.argv().env().file({file: __dirname + '/azure-key.json'});
const key = nconf.get('key');
const endpoint = nconf.get('endpoint');
const credentials = new msRest.ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': key } });
const faceClient = new Face.FaceClient(credentials, endpoint);

const image_base_url = "/resources/Face/Images/";
const person_group_id = uuid();

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// Above are from the document on the official website.


module.exports = {

    // create a personGroupPerson when creating an exam, uses Azure API
    initializePersonGroup: function (personGroupId, personGroupName, callback) {
        faceClient.personGroup.create(personGroupId, { recognitionModel: "recognition_02", name: personGroupName })
            .then(
                function (re) { callback(true); },
                function (err) {
                    if (err.statusCode === 409) callback(true);
                    else callback(false);
                }
            );
    },

    // create a personGroupPerson for a student, returns the personGroupPersonId
    initializePersonGroupPerson: function (email, personGroupId, callback) {
        faceClient.personGroupPerson.create(personGroupId, { name: email })
            .then(
                function (result) {
                    faceDao.addPersonId(email, result.personId, callback);
                },
                function (err) {
                    console.log(err);
                    callback({});
                },
            );
    },

    // get the personGroupPerson for a student
    getPersonId: function (email, callback) {
        faceDao.getPersonId(email, function (result) {
            if (!result) return callback(null);
            return callback(result);
        });
    },

    // add a Face to the personGroupPerson set of user, returns the FaceId if the Azure operation is successfull
    // (called when add the first image of a user, called when uploading ID)
    addUserFace: function (pictureFile, callback) {
        picture = fs.readFileSync(pictureFile);
        if (picture == null) console.log("File does not exist");
        faceClient.face.detectWithStream(picture, { detectionModel: "detection_01", recognitionModel: "recognition_02", returnFaceId: true, returnFaceAttributes: ["headPose"] })
            .then(
                callback,
                function (err) {
                    console.log(err);
                    callback(null);
                },
            );
    },

    // add a Face to the personGroupPerson set of user, returns the FaceId if the Azure operation is successfull
    // (called when verify exam taker face)
    addFaceToPerson: function (personGroupId, personId, imagePath, callback) {
        image = fs.readFileSync(imagePath);
        faceClient.face.detectWithStream(image, { detectionModel: "detection_01", recognitionModel: "recognition_02", returnFaceId: true })
            .then(
                function (faces) {
                    if (faces.length == 0) return callback(false);
                    faceClient.personGroupPerson.addFaceFromStream(personGroupId, personId, image, { recognitionModel: "recognition_02" })
                        .then(
                            callback,
                            function (err) {
                                console.log(err);
                                callback(null);
                            },
                        );
                },
                function (err) {
                    console.log(err);
                    callback(null);
                },
            );
    },

    // train personGroup set for the recognition
    trainPersonGroup: function (personGroupId, callback) {
        faceClient.personGroup.train(personGroupId, { recognitionModel: "recognition_02" })
            .then(
                function (re) { callback(true); },
                function (err) {
                    console.log(err);
                    callback(false);
                },
            );
    },

    // initialize the local storage for the face images uploaded. Called only when the server started.
    initializeFaceResources: function (callback) {
        if (!fs.existsSync(faceRecourseDir)) {
            fs.mkdirSync(path.join(__dirname, faceRecourseDir), { recursive: true }, function (err) {
                if (err) return callback(false);
                return callback(true);
            });
        }
    },

    // check if a user is same as the one on ID
    verifyUserFaceToFace: function (userId, photoId, callback) {
        faceClient.face.verifyFaceToFace(userId, photoId)
            .then(
                callback,
                function (err) {
                    console.log(err);
                    callback(false);
                },
            );
    },

    // Verify a person to the personGroupPerson date set 
    verifyUserFaceToPerson: function (faceId, personId, personGroupId, callback) {
        faceClient.face.verifyFaceToPerson(faceId, personId, { recognitionModel: "recognition_02", personGroupId: personGroupId })
            .then(
                callback,
                function (err) {
                    console.log(err);
                    callback(false);
                },
            );
    },

    // returns faceId
    addImage: function (email, imageFile, callback) {
        let image = {
            email: email,
            imageFilePath: path.join(imageFile.destination, imageFile.filename)
        };
        faceDao.addImage(image, function (addedImage) {
            if (addedImage == null) return callback(null);
            callback(addedImage);
        });
    },

    setIdFilePath: function (email, filepath, callback) {
        faceDao.setStudentIdFilePath(email, filepath, callback);
    },

    getIdFilePath: function (email, callback) {
        faceDao.getStudentIdFilePath(email, callback);
    }

};
