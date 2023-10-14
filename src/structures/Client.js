const { ChannelsAPI, InteractionsAPI } = require("@discordjs/core");
const { REST } = require("@discordjs/rest");
const { PrismaClient } = require("@prisma/client");
const { verifyKeyMiddleware } = require("discord-interactions");
const { readdirSync } = require("fs");

module.exports = class Client {

    constructor(){

        this.client = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
        this.channel = new ChannelsAPI(this.client);
        this.users = process.env.USERS.split(",").map(e => e.trim());
        this.token = process.env.APP_TOKEN;
        this.db = new PrismaClient();
        this.app = require("express")();
        this.interaction = new InteractionsAPI(this.client);
        this.app.use("/api/discord", verifyKeyMiddleware(process.env.DISCORD_PUBLICKEY));

    }

    load(){
        for(const controller of readdirSync("src/controllers")){
            const control = require("../controllers/" + controller);
            const c = new control(this);
        }
    }

    listen(){
        this.app.listen(process.env.PORT || 3000, (req, res, next) => {
            console.log("Server Running");
        })
    }

}