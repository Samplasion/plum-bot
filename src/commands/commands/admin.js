/* eslint-disable no-unused-vars */
const Command = require('../../classes/commands/Command.js');
const { oneLine } = require("common-tags");
const PlumUser = require("../../classes/User");
const PlumMessage = require("../../classes/Message");
const PlumGuild = require('../../classes/Guild.js');

module.exports = class AdminCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'admin',
            aliases: ["manage"],
            group: 'commands',
            memberName: 'admin',
            description: "Manages the bot's administration side",
            format: '<user|server> <view|flags> <ID> (add|delete) (...other arguments))',
            args: [
                {
                    key: "action",
                    label: '"user"|"server"',
                    type: "string",
                    prompt: "",
                },
                {
                    key: "subaction",
                    type: "string",
                    prompt: "",
                    default: ""
                },
                {
                    key: "args",
                    type: "string",
                    prompt: "",
                    default: ""
                },
            ],
            permLevel: 9
        });
    }
 
    async run(msg, { action, subaction, args }) {
        let actions = ["user", "server"];

        if (!actions.includes(action.toLowerCase()))
            return msg.error(`The action must be either ${this.client.utils.oxford(actions.map(s => "`" + s + "`")).replace(" and ", " or ")}`);

        let split = args.split(/\s+/g);
        let id = split.shift();
        // let joint = split.join(" ");

        if (!id)
            return msg.error("This command requires an ID.");

        console.log(action)

        return this[action](msg, subaction, id, split.join(" "))
    }

    async user(msg, action, id, args) {
        if (!action)
            action = "view";

        let actions = ["view", "flags"];

        if (!actions.includes(action.toLowerCase()))
            return msg.error(`The action for \`user\` must be either ${this.client.utils.oxford(actions.map(s => "`" + s + "`")).replace(" and ", " or ")}`);

        if (!this.client.users.resolve(id))
            return msg.error("That ID isn't of a user!");
            
        /** @type {PlumUser} */
        let user = await this.client.users.fetch(id);

        return this[`user_${action}`](msg, id, user, Array.isArray(args) ? args.join(" ") : args);
    }

    async user_view(msg, id, user, args) {
        let allMutuals = this.client.guilds.cache.filter(guild => !!guild.members.resolve(user.id));
        let maxServers = 10;

        let mutuals = allMutuals.first(maxServers);
        let others = Math.min(0, mutuals.length - maxServers);

        let embed = msg.makeEmbed()
            .setAuthor(user.tag, user.displayAvatarURL({ format: "png", dynamic: true }))
            .setTitle("User Administration")
            .addFieldsE("flag", this.client.utils.embedSplit(user.clientFlags.data.map(val => `• \`${val.key}\``).join("\n") || "None", "Flags"))
            .addFieldsE("server", this.client.utils.embedSplit((mutuals.map(guild => `• ${guild.name} [\`${guild.id}\`]`).join("\n") + (others > 0 ? `\n + ${this.client.utils.plural(others, "other")}` : "")) || "None", "Mutual servers"));

        return msg.info(`Here's more info about **${user.tag}** [\`${user.id}\`]`, embed);
    }

    async user_flags(msg, id, user, args) {
        let [action, flag, other] = args.split(/\s+/);

        let actions = ["add", "delete"];

        if (!action || !actions.includes(action.toLowerCase()))
            return msg.error(`The action for \`user flags\` must be either ${this.client.utils.oxford(actions.map(s => "`" + s + "`")).replace(" and ", " or ")}`);

        return this[`user_flags_${action}`](msg, user, flag, other);
    }

    /**
     * @param {PlumMessage} msg 
     * @param {PlumUser} user 
     * @param {string} flag 
     * @param {string[]} args 
     */
    async user_flags_add(msg, user, flag, args) {
        if (user.clientFlags.has(flag))
            return msg.error(`**${user.tag}** already has the flag \`${flag}\`.`);

        user.clientFlags.add(flag);

        if (user.clientFlags.has(flag))
            return msg.ok("The flag was added successfully.");
        else
            return msg.error("Something went wrong! Please retry.");
    }

    /**
     * @param {PlumMessage} msg 
     * @param {PlumUser} user 
     * @param {string} flag 
     * @param {string[]} args 
     */
    async user_flags_delete(msg, user, flag, args) {
        if (!user.clientFlags.has(flag))
            return msg.error(`**${user.tag}** doesn't have the flag \`${flag}\`.`);

        user.clientFlags.remove(flag);

        if (!user.clientFlags.has(flag))
            return msg.ok("The flag was deleted successfully.");
        else
            return msg.error("Something went wrong! Please retry.");
    }

    async server(msg, action, id, args) {
        if (!action)
            action = "view";

        let actions = ["view", "flags"];

        if (!actions.includes(action.toLowerCase()))
            return msg.error(`The action for \`guild\` must be either ${this.client.utils.oxford(actions.map(s => "`" + s + "`")).replace(" and ", " or ")}`);

        if (!this.client.guilds.resolve(id))
            return msg.error("That ID isn't of a server!");
            
        /** @type {PlumGuild} */
        let server = await this.client.guilds.resolve(id);

        return this[`server_${action}`](msg, id, server, Array.isArray(args) ? args.join(" ") : args);
    }

    async server_view(msg, id, server, args) {
        let embed = msg.makeEmbed()
            .setAuthor(server.name, server.iconURL({ format: "png", dynamic: true }))
            .setTitle("Server Administration")
            .addFieldsE("flag", this.client.utils.embedSplit(server.clientFlags.data.map(val => `• \`${val.key}\``).join("\n") || "None", "Flags"))

        return msg.info(`Here's more info about **${server.name}** [\`${server.id}\`]`, embed);
    }

    async server_flags(msg, id, server, args) {
        let [action, flag, other] = args.split(/\s+/);

        let actions = ["add", "delete"];

        if (!action || !actions.includes(action.toLowerCase()))
            return msg.error(`The action for \`server flags\` must be either ${this.client.utils.oxford(actions.map(s => "`" + s + "`")).replace(" and ", " or ")}`);

        return this[`server_flags_${action}`](msg, server, flag, other);
    }

    /**
     * @param {PlumMessage} msg 
     * @param {PlumGuild} user 
     * @param {string} flag 
     * @param {string[]} args 
     */
    async server_flags_add(msg, server, flag, args) {
        if (server.clientFlags.has(flag))
            return msg.error(`**${server.name}** already has the flag \`${flag}\`.`);

        server.clientFlags.add(flag);

        if (server.clientFlags.has(flag))
            return msg.ok("The flag was added successfully.");
        else
            return msg.error("Something went wrong! Please retry.");
    }

    /**
     * @param {PlumMessage} msg 
     * @param {PlumGuild} server 
     * @param {string} flag 
     * @param {string[]} args 
     */
    async server_flags_delete(msg, server, flag, args) {
        if (!server.clientFlags.has(flag))
            return msg.error(`**${server.name}** doesn't have the flag \`${flag}\`.`);

        server.clientFlags.remove(flag);

        if (!server.clientFlags.has(flag))
            return msg.ok("The flag was deleted successfully.");
        else
            return msg.error("Something went wrong! Please retry.");
    }
};