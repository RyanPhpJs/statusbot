const Client = require("./src/structures/Client");

require("dotenv").config();
const client = new Client();

client.load();
client.listen();