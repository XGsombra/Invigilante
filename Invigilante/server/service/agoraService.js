/* jshint esversion: 6 */

const nconf = require('nconf');
const {RtcTokenBuilder, RtcRole} = require('agora-access-token');

nconf.argv().env().file({file: __dirname + '/agora-key.json'});

module.exports = {

  generateToken: function(channelName, uid, callback, expireTime=3600) {
    const AppID = nconf.get('AppID');
    const AppCertificate = nconf.get('certificate');
    const role = RtcRole.PUBLISHER;
    const privilegeExpiredTime = Math.floor(Date.now() / 1000) + expireTime;
    // console.log(AppID, AppCertificate, channelName, uid, role, privilegeExpiredTime);
    const token = RtcTokenBuilder.buildTokenWithUid(AppID, AppCertificate, channelName, uid, role, privilegeExpiredTime);
    callback({
      appid: AppID,
      channel: channelName,
      token: token,
      uid: uid
    });
  },

};
