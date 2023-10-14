const Controller = require("../structures/Controller");
const { verifyKeyMiddleware, InteractionType, InteractionResponseType, InteractionResponseFlags } = require("discord-interactions");

module.exports = class Command extends Controller {

    callback = this.request({
        url: "/api/discord",
        method: "POST",
    }, async (req, res, next) => {
        const message = req.body;
        if(message.type === InteractionType.APPLICATION_COMMAND){
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: "Bot Online e funcionando normalmente",
                }
            });
        }

        if(message.type === InteractionType.MESSAGE_COMPONENT){
            /**
             * @type {string}
             */
            const customId = message.data.custom_id;
            const [action, id] = customId.split("/");

            if(action === "viewlogs"){
                if(this.client.users.includes(message.member.user.id)){
                    const log = await this.client.db.logs.findFirst({
                        where: {
                            log_id: id
                        }
                    })
                    if(!log){
                        return res.send({
                            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                            data: {
                                content: "Erro: Log não encontrado",
                                flags: InteractionResponseFlags.EPHEMERAL
                            }
                        });
                    }
                    await this.client.interaction.reply(message.id, message.token, {
                        files: [
                            {
                                'name': "log.txt",
                                'data': log.data
                            }
                        ],
                        flags: InteractionResponseFlags.EPHEMERAL
                    })
                    return res.send({});
                }
            }
        }
    });

}