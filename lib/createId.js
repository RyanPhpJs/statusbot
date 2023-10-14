const shortUUID = require("short-uuid");

const short = shortUUID([
    "abcdefghijklmonpqrstuvwxyz",
    "0123456789"
].join(""));

module.exports = function createId(){
    return short.new();
}