# Invigilante REST API Documentation

## Menu

- [User API](#User-API)
  - [Sign](#Sign)
  - [Email Verification](#Email-Verification)
  - [User Information](#User-Information)
- [Exam API](#Exam-API)
  - [Exam](#Exam)
  - [Participant](#Participant)
- [Face API](#Face-API)
  - [Face](#Face)
- [Constant](#Constant)

## User API

### Sign

- description: sign up a user
- request: `POST /api/user/signup/`
  - content-type: `application/json`
  - body: object
    - email: (string) the email of the user (needs to be unique)
    - username: (string) the username of the user
    - password: (string) the password of the user
    - role: (integer) Check [Constant Section](#Constant) for specific number for each role
- response: 200
  - content-type: `application/json`
  - body: object
    - message : "Successfully signed up user"
- response 400
  - content-type: `application/json`
  - body: object
    - message : "Please enter valid username"
- response 409
  - content-type: `application/json`
  - body: object
    - message : "This email is already used"

```
$ curl -X POST
       -d "email"="theory.songs@ufail.com"
       -d "username"="Theory_Songs"
       -d "password"="pass4Theo"
       -d "role"=0
       https://invigilante.website/api/user/signup/
```

- description: sign in a user
- request: `POST /api/user/signin/`
  - content-type: `application/json`
  - body: object
    - email: (string) the email of the user
    - password: (string) the password of the user
- response: 200
  - content-type: `application/json`
  - body: object
    - message : "Successfully logged in"
- response 401
  - content-type: `application/json`
  - body: object
    - message : "Wrong password"
- response 404
  - content-type: `application/json`
  - body: object
    - message : "This email address doesn't exist"

```
$ curl -X POST
       -d "email"="theory.songs@ufail.com"
       -d "password"="pass4Theo"
       https://invigilante.website/api/user/signin/
```

- description: sign out a user
- request: `GET /api/user/signout/`
- response: 200
  - content-type: `application/json`
  - body: object
    - message : "Successfully signed out"

```
$ curl https://invigilante.website/api/user/signout/
```

- description: Check if the user is signed in
- request: `GET /api/user/signedin/`
- response: 200
  - content-type: `application/json`
  - body: object
    - signedin : (integer) check [Constant Section](#Constant) for specific number for sign-in status

```
$ curl https://invigilante.website/api/user/signedin/
```

### Email Verification

- description: Send the verification email to verify the registered email address
- request: `PUT /api/user/authenticate/`
- response: 200
  - content-type: `application/json`
  - body: object
    - message : "Email sent"
- response: 400
  - content-type: `application/json`
  - body: object
    - message : (string) The error message
- response: 401
  - content-type: `application/json`
  - body: object
    - message : "Acess denied"

```
$ curl -X PUT
       https://invigilante.website/api/user/authenticate/
```

- description: Verification the registered email address
- request: `GET /api/user/authenticate`
  - query:
    - hash: the hash code generated for the email address
- response: 200
  - content-type: `application/json`
  - body: object
    - message : "Email address verified"
- response: 400
  - content-type: `application/json`
  - body: object
    - message : "This authentication has been used or expired"

```
$ curl https://invigilante.website/api/user/authenticate?hash=yOes%2BRSA02Q51rTMYRn0yjfeNooEhyAW8XhSURDjagAx9QEnboLOiil2hT%2B1oHYfRgzTOTxZEOXriPoaZ4KZkg%3D%3D
```

- description: Get the email verification status of user
- request: `GET /api/user/verified`
- response: 200
  - content-type: `application/json`
  - body: object
    - verified : (string) Check [Constant Section](#Constant) for specific number for verification status
- response: 401
  - content-type: `application/json`
  - body: object
    - message : "Access denied"
- response: 404
  - content-type: `application/json`
  - body: object
    - message : "User with this email does not exist"

```
$ curl https://invigilante.website/api/user/verified
```

### User Information

- description: Get the username
- request: `GET /api/user/username/:email`
  - params:
    - email: (string) the email address of user
- response: 200
  - content-type: `application/json`
  - body: object
    - username : (string) The username of the user
- response: 401
  - content-type: `application/json`
  - body: object
    - message : "Access denied"
- response: 404
  - content-type: `application/json`
  - body: object
    - message : "User with this email does not exist"

```
$ curl https://invigilante.website/api/user/username/theorysongs@ufail.com
```

## Exam API

### Exam

- description: Create an exam
- request: `POST /api/exam/`
  - content-type: `application/json`
  - body: object
    - channel: (string) the name of the exam (needs to be unique)
    - passcode: (string) the passcode of the examnumber for each role
- response: 200
  - content-type: `application/json`
  - body: object
    - message : "Exam created"
- response 400
  - content-type: `application/json`
  - body: object
    - message : (string) The error message
- response 401
  - content-type: `application/json`
  - body: object
    - message : (string) The error message
- response 409
  - content-type: `application/json`
  - body: object
    - message : "The exam with this token already exists"

```
$ curl -X POST
       -d "channel"="CSCC09Final"
       -d "passcode"="123456"
       https://invigilante.website/api/exam/
```

- description: Delete an exam
- request: `DELETE /api/exam/:channel`
  - params:
    - channel: (string) The channel of the exam
- response: 200
  - content-type: `application/json`
  - body: object
    - message : "Removed exam"
- response 400
  - content-type: `application/json`
  - body: object
    - message : (string) The error message
- response 401
  - content-type: `application/json`
  - body: object
    - message : (string) The error message
- response 404
  - content-type: `application/json`
  - body: object
    - message : "This exam does not exist"

```
$ curl -X DELETE
       https://invigilante.website/api/exam/cscc09
```

- description: Get all exams
- request: `GET /api/exam/exams`
- response: 200
  - content-type: `application/json`
  - body: object
    - exams : (array) The array of all exam channels

```
$ curl https://invigilante.website/api/exam/exams
```

- description: Allocate an agora token for the exam and get it
- request: `PUT /api/exam/:channel/`
  - params:
    - channel: (string) The channel of the exam
- response: 200
  - content-type: `application/json`
  - body: object
    - agoraSpec: (string) The agora token of the exam
- response 400
  - content-type: `application/json`
  - body: object
    - message : (string) The error message
- response 401
  - content-type: `application/json`
  - body: object
    - message : (string) The error message
- response 403
  - content-type: `application/json`
  - body: object
    - message : "Access denied"
- response 404
  - content-type: `application/json`
  - body: object
    - message : "This exam does not exist"

```
$ curl -X PUT
       https://invigilante.website/api/exam/cscc09
```

### Participant

- description: Get the email of all students in an exam
- request: `GET /api/exam/:channel/students`
  - params:
    - channel: (string) The channel of the exam
- response: 200
  - content-type: `application/json`
  - body: object
    - students : (array) Array of students'email addresses
- response 400
  - content-type: `application/json`
  - body: object
    - message : (string) The error message
- response 401
  - content-type: `application/json`
  - body: object
    - message : (string) The error message
- response 404
  - content-type: `application/json`
  - body: object
    - message : "This exam does not exist"

```
$ curl https://invigilante.website/api/exam/cscc09/students
```

- description: Get the email of all invigilators of an exam
- request: `GET /api/exam/:channel/invigilators`
  - params:
    - channel: (string) The channel of the exam
- response: 200
  - content-type: `application/json`
  - body: object
    - invigilators : (array) Array of invigilators'email addresses
- response 400
  - content-type: `application/json`
  - body: object
    - message : (string) The error message
- response 401
  - content-type: `application/json`
  - body: object
    - message : (string) The error message
- response 404
  - content-type: `application/json`
  - body: object
    - message : "This exam does not exist"

```
$ curl https://invigilante.website/api/exam/cscc09/invigilators
```

- description: Verify students before entering the waiting room of exam
- request: `POST /api/exam/:channel/verify`
  - params:
    - channel: (string) The channel of the exam
  - content-type: `application/json`
  - body: object
    - passcode: (string) the passcode of the examnumber for each role
- response: 200
  - content-type: `application/json`
  - body: object
    - message : "Correct passcode"
- response 400
  - content-type: `application/json`
  - body: object
    - message : (string) The error message
- response 401
  - content-type: `application/json`
  - body: object
    - message : (string) The error message
- response 403
  - content-type: `application/json`
  - body: object
    - message : "Wrong passcode for the exam"
- response 404
  - content-type: `application/json`
  - body: object
    - message : "This exam does not exist"

```
$ curl -X POST
       -d "passcode"="123456"
       https://invigilante.website/api/exam/cscc09/verify
```

- description: Enter or exit an exam as student
- request: `POST /api/exam/:channel/students/:action`
  - params:
    - channel: (string) The channel of the exam
    - action: (string) Check [Constant Section](#Constant) for specific action
- response: 200
  - content-type: `application/json`
  - body: object
    - agoraSpec : (string) The agora token of the exam
- response 400
  - content-type: `application/json`
  - body: object
    - message : (string) The error message
- response 401
  - content-type: `application/json`
  - body: object
    - message : (string) The error message
- response 404
  - content-type: `application/json`
  - body: object
    - message : (string) The error message
- response 409
  - content-type: `application/json`
  - body: object
    - message : "This student has already entered the exam"

```
$ curl -X PUT
       https://invigilante.website/api/exam/cscc09/students/enter
```

- description: Exit an exam as invigilator
- request: `PUT /api/exam/:channel/invigilators`
  - params:
    - channel: (string) The channel of the exam
- response: 200
  - content-type: `application/json`
  - body: object
    - message: "Invigilator left the exam"
- response 400
  - content-type: `application/json`
  - body: object
    - message : (string) The error message
- response 401
  - content-type: `application/json`
  - body: object
    - message : (string) The error message
- response 404
  - content-type: `application/json`
  - body: object
    - message : (string) The error message

```
$ curl -X PUT
       https://invigilante.website/api/exam/cscc09/invigilators
```

- description: Promote students to be invigilator
- request: `PUT /api/exam/:channel/promote`
  - params:
    - channel: (string) The channel of the exam
- response: 200
  - content-type: `application/json`
  - body: object
    - message: "Promoted student to invigilator"
- response 400
  - content-type: `application/json`
  - body: object
    - message : (string) The error message
- response 401
  - content-type: `application/json`
  - body: object
    - message : (string) The error message
- response 403
  - content-type: `application/json`
  - body: object
    - message : "Access denied"
- response 404
  - content-type: `application/json`
  - body: object
    - message : "This exam does not exist"

```
$ curl -X PUT
       https://invigilante.website/api/exam/cscc09/promote
```

- description: Get the ID of an exam taker
- request: `PUT /api/exam/id/:email`
  - params:
    - email: (string) The email of the exam taker
- response: 200
  - content-type: ID mimetype
  - body:
    - file: the ID photo of the exam taker
- response 400
  - content-type: `application/json`
  - body: object
    - message : (string) The error message
- response 401
  - content-type: `application/json`
  - body: object
    - message : (string) The error message
- response 404
  - content-type: `application/json`
  - body: object
    - message : "Error message"

```
$ curl -X PUT
       https://invigilante.website/api/exam/cscc09/promote
```

## Face API

### Face

- description: Initialized the person group for the exam
- request: `POST /api/face/initialize/`
  - content-type: `application/json`
  - body: object
    - channel : Channel of the exam
- response: 200
  - content-type: `application/json`
  - body: object
    - message : "Successfully initialzed the person group"
- response 400
  - content-type: `application/json`
  - body: object
    - message : (string) The error message
- response 401
  - content-type: `application/json`
  - body: object
    - message : (string) The error message

```
$ curl -X POST
       -d "channel"="cscc09"
       https://invigilante.website/api/face/initialize/
```

- description: Initialized the person group person for the exam
- request: `POST /api/face/personGroupPerson/`
- response: 200
  - content-type: `application/json`
  - body: object
    - message : "Successfully initialzed the person group person"
- response 400
  - content-type: `application/json`
  - body: object
    - message : (string) The error message
- response 401
  - content-type: `application/json`
  - body: object
    - message : (string) The error message

```
$ curl -X POST
       https://invigilante.website/api/face/personGroupPerson/
```

- description: Get the personGroupPerson for the exam taker
- request: `GET /api/face/personGroupPerson/:email`
  - params:
    - email: (string) The email address of the user
- response: 200
  - content-type: `application/json`
  - body: object
    - personId : (string) The personId of the exam taker
- response 400
  - content-type: `application/json`
  - body: object
    - message : (string) The error message
- response 401
  - content-type: `application/json`
  - body: object
    - message : (string) The error message

```
$ curl -X POST
       https://invigilante.website/api/face/personGroupPerson/
```

- description: Upload the photo ID of the exam taker
- request: `POST /api/face/face`
  - content-type: `form-data`
  - file: (image) ID photo
- response: 200
  - content-type: `application/json`
  - body: object
    - personId : (string) The personId of the exam taker
- response 400
  - content-type: `application/json`
  - body: object
    - message : (string) The error message
- response 401
  - content-type: `application/json`
  - body: object
    - message : (string) The error message

```
$ curl -X POST
       -F"file=@\path\IDphoto.jpg"
       https://invigilante.website/api/face/face/
```

- description: Train the photo set of the exam taker
- request: `PATCH /api/face/face`
- response: 200
  - content-type: `application/json`
  - body: object
    - personId : "Successfully trained person group"
- response 400
  - content-type: `application/json`
  - body: object
    - message : (string) The error message
- response 401
  - content-type: `application/json`
  - body: object
    - message : (string) The error message

```
$ curl -X PATCH
       https://invigilante.website/api/face/face/
```

- description: Upload the screenshot of the exam taker and verify the identity of the exam taker
- request: `POST /api/face/face`
  - content-type: `form-data`
  - file: (image) ID photo
- response: 200
  - content-type: `application/json`
  - body: object
    - isIdentical : (boolean) True if the exam taker matches the ID photo, False otherwise
    - confidence : (float) The probability of the isIdentical result being correct
    - headPose : (boolean) True if the exam taker is not looking around
- response 400
  - content-type: `application/json`
  - body: object
    - message : (string) The error message
- response 401
  - content-type: `application/json`
  - body: object
    - message : (string) The error message

```
$ curl -X POST
       -F"file=@\path\IDphoto.jpg"
       https://invigilante.website/api/face/face/verification/
```

## Constant

### role

- admin: 0
- student: 1

### signedin

- not signed in: 0
- signed in: 1

### verified

- not verified: "false"
- verified: "true"

### action

- enter: "enter"
- exit: "exit"
