const frases = require("../config/frases.json");
module.exports = function getRandom() {
    return frases[Math.floor(Math.random() * frases.length)];
}