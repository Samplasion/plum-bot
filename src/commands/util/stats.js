const Command = require("../../classes/commands/Command");
const { version } = require("discord.js");
const moment = require("moment");
const Embed = require("../../classes/Embed");
require("moment-duration-format");

module.exports = class StatsCommand extends Command {
    constructor(client) {
        super(client, {
            name: "stats",
            group: "util",
            memberName: "stats",
            description: "Shows some stats of the bot.",
            details:
                "Shows stats such as uptime, memory usage and Discord.js version.",

            args: []
        });
    }

    async run(msg, args, level) {
        // eslint-disable-line no-unused-vars
        const duration = moment
            .duration(this.client.uptime)
            .format(" D [days], H [hrs], m [mins], s [secs]");
        const elapsed = moment
            .duration(moment().diff(moment(this.client.user.createdAt)))
            .format(
                "Y [years], D [days], H [hours], m [minutes] [and] s [seconds] [ago]"
            );

        let embed = new Embed(this.client)
            .setTitle(msg.t("commands/stats:TITLE"))
            .setDescription(msg.t("commands/stats:DESCRIPTION", { name: this.client.user.username, version: this.client.version }))
            .addFields(
                {
                    name: msg.t("commands/stats:MEMORY_USAGE"),
                    value: msg.t("commands/stats:MEMORY_USAGE_DESC", { mb: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) }),
                    inline: true
                },
                { name: msg.t("commands/stats:UPTIME"), value: humanize(this.client.uptime), inline: true },
                { name: "\u200b", value: "\u200b", inline: true },
                {
                    name: msg.t("commands/stats:USERS"),
                    value: msg.t("commands/stats:USERS_DESC", {
                        users: this.client.guilds.cache
                            .reduce((total, server) => total + server.memberCount, 0)
                            .toLocaleString(),
                        channels: this.client.channels.cache.size.toLocaleString(),
                        servers: this.client.guilds.cache.size.toLocaleString()
                    }),
                    inline: true
                },
                {
                    name: msg.t("commands/stats:VERSIONS"),
                    value: msg.t("commands/stats:VERSIONS_DESC", {
                        discord: version,
                        node: process.version
                    }),
                    inline: true
                },
                { name: msg.t("commands/stats:CREATION_DATE"), value: humanize(Date.now() - this.client.user.createdAt) + " ago", inline: false }
            );

        msg.channel.send(embed);
    }
};
