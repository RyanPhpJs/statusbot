require("dotenv").config();

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("@discordjs/builders");
const { ChannelsAPI, ButtonStyle, InteractionsAPI } = require("@discordjs/core");
const { REST } = require("@discordjs/rest");
const { verifyKeyMiddleware, InteractionType, InteractionResponseType, InteractionResponseFlags } = require("discord-interactions");
const express = require("express");
const frases = require("./lib/frases");
const mongoose = require("mongoose");
const createId = require("./lib/createId");

const app = express();
const client = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
const channel = new ChannelsAPI(client);
mongoose.connect(process.env.MONGO_DATABASE);
const users = process.env.USERS.split(",").map(e => e.trim());

const Logs = mongoose.model('Logs', {
    log_id: String,
    data: String,
    clusterId: Number,
});

app.use("/api/discord", verifyKeyMiddleware(process.env.DISCORD_PUBLICKEY), async (req, res) => {

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
            if(users.includes(message.member.user.id)){
                const log = await Logs.findOne({
                    log_id: id
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
                const interaction = new InteractionsAPI(client);
                await interaction.reply(message.id, message.token, {
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
// avatar_url|name|cluster_id|country|provider
app.post("/api/send/online", express.json({ type: (e) => true, limit: '3mb'}), async (req, res) => {
    
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

    const message = await channel.createMessage(process.env.CHANNEL_ID, {
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
    })

});

// data|cluster_id|resumed
app.post("/api/send/error", express.json({ type: (e) => true, limit: '3mb'}), async (req, res, next) => {
    const id = createId();
    const result = await Logs.create({
        log_id: id,
        data: req.body.data,
        clusterId: req.body.cluster_id
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
                .setStyle(ButtonStyle.Primary)
        )

    const message = await channel.createMessage(process.env.CHANNEL_ID, {
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

app.listen(process.env.PORT || 4000, () => console.log("Server Running"));