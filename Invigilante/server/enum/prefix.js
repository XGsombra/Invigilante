/* jshint esversion: 6 */

module.exports = {
    user: "user",
    auth: "auth",
    authExpire: "authExpire",
    session: "session",
    exam: "exam",
    students: "students",
    invigilators: "invigilators",
    personId: "personId",
    ip: "ip",
    id: "id",

    strip: function (prefix, entry) {
        return entry.slice(prefix.length);
    }
};