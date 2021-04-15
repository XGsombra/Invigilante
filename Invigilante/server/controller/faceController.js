/* jshint esversion: 6 */

const express = require('express');
const bodyParser = require('body-parser');
const faceController = express.Router();
const faceService = require("../service/faceService");
const roleEnum = require("../enum/role");
const multer = require('multer');
const path = require("path");
const tool = require("./tool");

let upload = multer({ dest: path.join(__dirname, '../resources/Face/Images/') });

faceController.use(bodyParser.json());

// initialize the person group
faceController.post("/initialize/", tool.isAuthenticated, tool.isAdmin, function (req, res, next) {
    if (req.body.channel == null) {
        return res.status(400).json({ message: "Bad input" });
    }
    faceService.initializePersonGroup(req.body.channel, req.body.channel, function (success) {
        if (!success) return res.status(500).json({ message: "Failed to initialze the person group" });
        req.session.personGroupId = req.body.examId;
        res.status(200).json({ message: "Successfully initialzed the person group" });
    });
});

// initialize the person group person for student
faceController.post("/personGroupPerson/", tool.isAuthenticated, function (req, res, next) {
    if (!req.session.personGroupId)
        return res.status(400).json({ message: "Person group not created" });
    faceService.initializePersonGroupPerson(req.session.email, req.session.personGroupId, function (result) {
        if (!result.personId) return res.status(500).json({ message: "Cannot add person" });
        req.session.personId = result.personId;
        return res.status(200).json({ message: "Successfully initialzed the person group person" });
    });
});

faceController.get("/personGroupPerson/:email", tool.isAuthenticated, tool.isAdmin, function (req, res, next) {
    if (!req.params.email)
        return res.status(400).json({ message: "Bad input" });
    faceService.getPersonId(req.params.email, function (personId) {
        if (!personId) return res.status(404).json({ message: "This email does not have corresponding personId" });
        return res.status(200).json({ personId: personId });
    });
});

//add id photo to the person group person
faceController.post('/face/', tool.isAuthenticated, upload.single('file'), function (req, res, next) {
    if (!req.session.personGroupId || !req.session.personId)
        return res.status(400).json({ message: "Need to initiate exam or person first before uploading ID photo!" });
    // add the image to Azure
    faceService.addImage(req.session.email, req.file, function (result) {
        if (result == null) {
            return res.status(500).json({ message: "Failed to upload ID photo" });
        }
        let imageFilePath = path.join(req.file.destination, req.file.filename);
        // store the id photo path
        faceService.setIdFilePath(req.session.email, imageFilePath, function (added) {
            if (!added) res.status(500).json({ message: "Failed to add ID photo" });
            // add id to Azure
            faceService.addFaceToPerson(req.session.personGroupId, req.session.personId, imageFilePath, function (face) {
                let persistedFaceId = face.persistedFaceId;
                return res.status(200).json({ message: "Successfully uploaded ID photo" });
            });
        });
    });
});

// train the person face data on Azure
faceController.patch("/face/", tool.isAuthenticated, tool.isAdmin, function (req, res, next) {
    faceService.trainPersonGroup(req.session.personGroupId, function (success) {
        if (!success) return res.status(500).json({ message: "Failed to train person group" });
        return res.status(200).json({ message: "Successfully trained person group" });
    });
});

faceController.post('/face/verification/', tool.isAuthenticated, tool.isAdmin, upload.single("file"), function (req, res, next) {
    let imageFilePath = path.join(req.file.destination, req.file.filename);
    if (!req.body.personId) return res.status(400).json({ message: "Bad input" });
    faceService.addUserFace(imageFilePath, function (face) {
        if (face == null) return res.status(500).json({ isIdentical: false, confidence: 0, message: "Click slower (Need donation to upgrade service :( )" });
        // no face detected
        if (face.length === 0) return res.status(200).json({ isIdentical: false, confidence: 0, message: "Missing face in the image" });
        // more than 1 face detected
        if (face.length > 1) return res.status(200).json({ isIdentical: false, confidence: 0, message: "More than one face in the image" });
        // verify the face and the head pose
        headPose = face[0].faceAttributes.headPose;
        faceService.verifyUserFaceToPerson(face[0].faceId, req.body.personId, req.session.personGroupId, function (result) {
            if (result === false) {
                return res.status(200).json({ isIdentical: false, confidence: 0, message: "Click slower (Need donation to upgrade service :( )" });
            }
            result.headPose = headPose.yaw > -20 && headPose.yaw < 20;
            if (!result.headPose) {
                result.message = "Suspicious face direction";
            }
            if (result.isIdentical) {
                faceService.addFaceToPerson(req.session.personGroupId, req.body.personId, imageFilePath, function (success) {
                    if (!success) return res.status(200).json({ isIdentical: false, confidence: 0, message: "Failed to update image after verification" });
                    return res.status(200).json(result);
                });
            } else {
                return res.status(200).json(result);
            }
        });
    });
});


module.exports = faceController;
