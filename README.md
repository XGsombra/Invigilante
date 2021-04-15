# Invigilante

## Team Members

- ##### Xuduo Gu

- ##### Ruiming Xu

- ##### Joey Huang

## Table of content

1. [Proposal](#proposal)
    * [description](#description-of-the-web-application)
    * [features(beta)](#key-features-for-beta-version)
    * [features(final)](#additional-features-for-final-version)
    * [technologies](#technology-that-we-will-use)
    * [challenges](#top-five-technical-challenges)

2. [Final Verion](#final-version)

3. [Demonstration](#demonstration)

4. [API Documentation](#api-documentation)

## Proposal

### Description of the web application

During the Covid-19 pandemic, many academic institutions and companies adapted online study/working. Specifically, this makes exam evaluation a difficult task. Evaluating by online exams is one popular substitution, and this raised the need for a convenient online exam invigilation tool. This web application should allow teaching assistants/professors to easily manage students in groups, along with a posture detector that raises a warning when a student does not follow the customizable requirement (e.g. shoulder and above in camera view, hands in camera view, etc.)

### Key features for Beta version

- Students/teaching assistants log in using user accounts  
  Head invigilators log in using an admin account
- The head invigilator can promote other accounts to be the co-invigilators for a specific exam (therefore the student that is taking a course while being the teaching assistant for another course only needs one account.)
- An invigilator can hold and join an exam.
- A normal account can join an exam. Each exam has a distinct room.
- Support video streaming for accounts that is currently in an on-going exam.
- The hand-up queue for questions. Invigilators can remove students from this queue.

### Additional features for Final version

- Invigilators can start a breakout room with selected students  
  (or maybe auto separate)
- Match the actual student’s face with their TCard photo
- Posture detection of customizable requirements (e.g. shoulder and above in camera view, hands in camera view, etc.)
- Illegal aids detection (e.g. detect if there is a phone in the scene)
- Detect if a student is on the current tab

### Technology that we will use

- [Nodejs](https://nodejs.org/en/) - backend webserver, as it supports video streaming APIs
- [Angular](https://angular.io/) - frontend web application platform, provides the client side interaction with users
- [Angular Material](https://material.angular.io/) - Angular website framework by Google open-source, serves the Angular platform with numerous UI designs
- [Semantic UI](https://semantic-ui.com/) - open-source frontend web framework, provides various clean themes and components
- [Redis](https://redis.io/) - database, NoSQL database with good performance that is widely used
- [Agora](https://docs.agora.io/en/Video/api-ref?platform=All%20Platforms) - video streaming, a well-documented API, this video streaming API is user friendly
- [Google Vision API](https://cloud.google.com/vision/docs/detecting-faces) - google face detection API, which will be used to detect facial expressions and number of faces, with the restriction of unable to match faces to specific one
- [Microsoft Computer Vision API](https://azure.microsoft.com/en-us/services/cognitive-services/computer-vision/#features) - an API to detect the elements of an image, with corresponding confidence (e.g. report there is a phone in the image, with confidence of 85.42334234%)

### Top five technical challenges

- Synchronized video streaming for the exam invigilation
- High concurrency of many students having video streaming, so we need to deal with the multi-thread scenario.
- Face detection and recognition to authenticate students, which requires support of external AI API
- Instant feedback of suspecious actions of students and screenshot for record
- Integrate multiple external APIs into our application

## Final version

The website an be accessed [here](https://invigilante.website/)

## Demonstration

The demonstration video can be found [here](https://www.youtube.com/watch?v=f-_kkOYcSoM)

## API Documentation

The documentation can found [here](docs/README.md)

## Tips on testing the application locally

### Frontend

[Angular 11](Invigilante/client/README.md)

Under the `client` folder, start the frontend by `npm start`. The website can be accessed at `http://localhost:4200`. (We use reverse proxy in the production server, therefore the application itself will be run on HTTP on its own.)

### Backend

The application requires several configuration file to be in place to be testable locally. We cannot put them inside the repository since some of them include private keys.
Here is a few tips if you want to have the application running locally.

- Under the `server` folder

  1. Create an `.env` file containing `NODE_ENV=development` that configures the run time environment.

  2. There is NO need to have `server.key` and `server.crt` that contains the private key and public certificate.

- Under the `server/service` folder

  1. Create an `agora-key.json` file that configure the agora api. This is essential to use the agora client. Format of this file will be as following:

      {
        "AppID": "...",
        "certificate": "..."
      }

      Values of these two fields can be obtained by having an active subscription to Agora.

  2. Create an `azure-key.json` file that configure the Azure api. This is essential to use the face client. Format of this file will be as following:

      {
        "key": "...",
        "endpoint": "..."
      }

      Values of these two fields can be obtained by having an active subscription to Azure.

Missing any of the above files will fail to start up the backend server. Due to the security issues and [Piazza post](https://piazza.com/class/kj093ojz8cw239?cid=315), we won't publish any secret keys on GitHub directly. Contract us for the keys if needed.

The Redis server needs to be started and listening on the default port.

Under the `server` folder, start the server by `nodemon server.js`.

