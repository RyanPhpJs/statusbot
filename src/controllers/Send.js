const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("@discordjs/builders");
const createId = require("../../lib/createId");
const Controller = require("../structures/Controller");
const frases = require("../../lib/frases");
const { ButtonStyleTypes } = require("discord-interactions");

module.exports = class Send extends Controller {

    online = this.request({
        url: "/api/send/online",
        body: {
            avatar_url: { type: "string", required: true },
            name: { type: "string", required: true },
            cluster_id: { type: "number", required: true },
            country: { type: "string" },
            provider: { type: "string" },
        },
        auth: true,
        method: "POST"
    }, async (req, res, next) => {
        const embed = new EmbedBuilder()
            .setColor(3289855)
            .setThumbnail(req.body.avatar_url)
            .setTitle(`${req.body.name} está online`)
            .addFields({
                name: "ClusterID",
                value: String(req.body.cluster_id),
            }, {
                name: "Server Country",
                value: req.body.country || "Uknown",
                inline: true,
            },
            {
                name: "Server Provider",
                value: req.body.provider || "Uknown",
                inline: true,
            })
            .setFooter({
                text: frases(),
            })

        const message = await this.client.channel.createMessage(process.env.CHANNEL_ID, {
            embeds: [embed]
        });

        res.send({
            success: true,
            message: {
                id: message.id,
                embeds: message.embeds,
                content: message.content,
                channel_id: message.channel_id,
                guild_id: message.guild_id
            }
        });
    })

    error = this.request({
        url: "/api/send/error",
        auth: true,
        method: "POST",
        body: {
            data: { type: "string", required: true },
            cluster_id: { type: "number" },
            resumed: { type: "string" }
        }
    }, async (req, res, next) => {
        const id = createId();
        const result = await this.client.db.logs.create({
            data: {
                'log_id': id,
                'data': req.body.data,
                'cluster_id': req.body.cluster_id
            }
        });

        const embed = new EmbedBuilder()
            .setColor(3289855)
            .setTitle('Um erro ocorreu')
            .setThumbnail('https://cdn0.iconfinder.com/data/icons/shift-interfaces/32/Error-512.png')
            .addFields({
                name: "LogId",
                value: id,
                inline: true
            }, {
                name: "ClusterId",
                value: String(req.body.cluster_id) || 'Uknown',
                inline: true
            }).setFooter({ text: frases() });

        if(req.body.resumed){
            embed.setDescription(`\`\`\`elixir\n${req.body.resumed.slice(0,400)}${req.body.resumed.length > 400 ? "..." : ""}\n\`\`\``)
        }

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('viewlogs/' + id)
                    .setLabel('Ver Detalhes')
                    .setEmoji({
                        name: '📰'
                    })
                    .setStyle(ButtonStyleTypes.PRIMARY)
            )

        const message = await this.client.channel.createMessage(process.env.CHANNEL_ID, {
            content: process.env.NOTIFY_IDS.split(",").map(e => `<@&${e.trim()}>`).join(" "),
            embeds: [embed],
            components: [row]
        });

        res.send({
            success: true,
            message: {
                id: message.id,
                embeds: message.embeds,
                content: message.content,
                channel_id: message.channel_id,
                guild_id: message.guild_id
            },
            result: {
                log_id: result.log_id
            }
        });
    })

}