const { combinations } = require("mathjs");

module.exports = async (client, message) => {
    if (message.author.bot) return;

    const prefixMention = new RegExp(`^<@!?${client.user.id}>( |)$`);
    if (message.content.match(prefixMention) && message.guild) {
        let e = client.utils.embed()
            .setTitle("Welcome to " + client.user.username + "!")
            .setDescription("I hope you'll like this new bot, which I've put hours into making as polished as it can be. Oh, and the prefix is `" + message.guild.commandPrefix + "`")
        return message.channel.send(e)
    }

    if (message.command) {
        // assume it's a command
        if (client.global.has("log-channel") && client.channels.resolve(client.global.get("log-channel"))) {
            let channel = await client.channels.fetch(client.global.get("log-channel"));
            channel.send(`[${new Date()}] ${message.author.tag} ran the ${message.command.name} command in #${message.channel.name}: ${message.cleanContent}`);
        } else {
            console.log(
                `${message.author.tag} ran the ${message.command.name} command in ${message.channel ? "#" + message.channel.name : "DMs"}: ${message.cleanContent}`
                .split("\n")
                .map(row => `  [CMD] ${row}`)
                .join("\n")
            );
        }
    } else {
        let getsPoints = true;

        if (message.guild.config.get("hateblock") && !message.author.bot) {
            if (message.guild.config.get("hatebypass") &&
                message.member.roles.cache.has(message.guild.config.get("hatebypass").id))
                return;
            
            let arr = message.guild.swears;
            if (arr && arr.length) {
                let s = [];
                arr.forEach(swear => {
                    let c = message.content
                        .normalize("NFD") // Splits "è" into "e" + "`" 
                        .replace(/[\u0300-\u036f]/g, "") // Strips diacritics
                        .toLowerCase()
                    if (swear.test(c)) {
                        s.push(c.match(swear));
                        getsPoints = false;
                    }
                })
            
                if (!getsPoints) {
                    message.isSwear = true;
                    message.swear = s.flat();
                    if ((message.guild.config.get("hatemsgdel") || message.guild.config.get("hateresend")) && message.channel.permissionsFor(message.guild.me).has("MANAGE_MESSAGES"))
                        await message.delete();
                    getsPoints = false;
                    if (message.guild.config.get("hateresend")) {
                        let wh = await message.channel.getFirstWebhook();
                        if (wh) {
                            let content = message.content;
                            for (let s of message.swear) {
                                content = content.split(new RegExp((String.raw`${s.trim()}`).replace("\\", "\\\\"), "i")).join("•".repeat(s.trim().length))
                            }
                            wh.send(
                                content,
                                {
                                    username: message.member.displayName,
                                    avatarURL: message.author.displayAvatarURL(),
                                    embeds: message.embeds
                                }
                            )
                        }
                    } else if (message.guild.config.get("hateresponse"))
                        message.channel.send(client.utils.render(message, message.guild.config.get("hateresponse")));

                    let e = client.utils.emojis;
                    let embed = client.utils.embed()
                        .setAuthor(message.author.tag, message.author.displayAvatarURL())
                        .setTitle(`${e.name} Swear`)
                        .setDescription(`Content:\n\n||${message.cleanContent}||\n\nTriggering word(s): ||${message.swear.join("||, ||")}||`)
                        .addField(`${e.channel} Channel`, `<#${message.channel.id}> (#${message.channel.name})`)
                        .addField(`${e.calendar} Caught on`, client.utils.fmtDate(new Date(message.createdTimestamp)))
                        .addField(`${e.id} Message ID`, message.id);
                    await message.guild.log(embed);

                    message.author.swears.add(message);
                }
            }
        }

        if (message.guild && !message.author.bot && getsPoints) {
            let lvlup = message.member.points.award();
            if (lvlup && message.guild.id != "623600255987875870" && message.guild.config.data.levelupmsgs == "true") {
                let embed = client.utils.embed()
                    .setAuthor(message.member.displayName, message.author.displayAvatarURL())
                    .setColor(message.member.displayHexColor)
                    .setTitle("Congratulations!")
                    .setDescription("You've leveled UP!")
                    .addField("New Level", message.member.points.data.level)
                    .setThumbnail(message.author.displayAvatarURL());
                await message.channel.send(embed)
            }
        }
    }
}