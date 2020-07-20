const { oneLine } = require("common-tags");
const Command = require('./../../classes/Command.js');

module.exports = class TagsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'tags',
            aliases: ["tag"],
            group: 'util',
            memberName: 'tags',
            description: "See, list, create and remove the server's tags.",
            details: oneLine`Removing supports specifying multiple
            tags at once (e.g. \`tags remove tag1 tag2 tag3\`).
            Adding also supports specifying multiple tags at once
            (e.g. \`tags add tag1 Text number 1, tag2 Text Number 2\`).
            To avoid a comma getting confused for a multiple tag delimiter,
            prepend it with another comma, like so: \`tags add test This
            tag is one,, long tag with a comma,, maybe two.\``,
            guildOnly: true,

            args: [
                {
                    key: "action",
                    type: "string",
                    prompt: "",
                    // oneOf: ["list", "add", "remove"],
                    default: "list"
                },
                {
                    key: "arg",
                    type: "string",
                    default: "",
                    prompt: ""
                }
            ]
        });
    }

    run(msg, { action, arg }) {
        let args = ["list", "add", "remove"];

        if (!args.includes(action)) {
            if (msg.guild.tags.list.map(tag => tag.name).includes(action))
                return this.view(msg, action);
            return msg.error(`This command accepts an argument that may be either ${args.map(a => `\`${a}\``).join(", ")} or a tag name.`);
        }
        return this[action](msg, arg);
    }

    view(msg, name) {
        msg.channel.send(msg.guild.tags.list.filter(tag => tag.name == name)[0].text);
    }

    add(msg, rawStr) {
        if (msg.member.level.level < 3)
            return msg.error("The minimum permission for adding tags is **Server admin** [3]");
            
        let tagsToAdd = rawStr.split(/(?<!,),(?!,)\s+/g);

        let added = [],
            notAdded = [];
        
        for (let raw of tagsToAdd) {
            let text = raw.split(" ");
            let name = text.shift();
            text = text.join(" ");

            if (msg.guild.tags.list.map(tag => tag.name).includes(name)) {
                notAdded.push({ name, reason: "A tag with that name already exists!" });
                continue;
            }
        
            if (!text) {
                notAdded.push({ name, reason: "There has to be some text to the tag." });
                continue;
            }

            msg.guild.tags.add(name, text.split(",,").join(","));
            added.push(name);
        }

        if (added.length == 1 && !notAdded.length)
            return msg.ok(`The tag was added. To see it, run \`${msg.prefix}tag ${added[0]}\``);

        let combined = []
        if (added.length) {
            combined.push({
                type: "ok",
                message: `The following ${added.length > 1 ? "tags were" : "tag was"} added: ${added.map(t => `\`${t}\``).join(", ")}`
            })
        }
        if (notAdded.length) {
            combined.push({
                type: "error",
                message: `The following ${notAdded.length > 1 ? "tags were" : "tag was"}n't added:\n${notAdded.map(obj => `- \`${obj.name}\`: ${obj.reason}`).join("\n")}`
            })
        }

        return msg.combine(combined);
    }

    list(msg) {
        if (!msg.guild.tags.list.length)
            return msg.info("There are no tags.")
        
        return msg.channel.send(this.client.utils.fastEmbed(
            "Tags",
            msg.guild.tags.list.map(tag => `**${tag.name}**`).join(", ")
        ));
    }

    remove(msg, name) {
        if (msg.member.level.level < 3)
            return msg.error("The minimum permission for removing tags is **Server admin** [3]");

        let names = name.split(/\s+/g);

        let deleted = [],
            kept = [];

        for (let tag of names) {
            if (!msg.guild.tags.list.map(t => t.name).includes(tag))
                kept.push(tag);
            else {
                msg.guild.tags.remove(tag);
                deleted.push(tag);
            }
        }

        let combined = []
        if (deleted.length) {
            combined.push({
                type: "ok",
                message: `The following ${deleted.length > 1 ? "tags were" : "tag was"} deleted: ${deleted.map(t => `\`${t}\``).join(", ")}`
            })
        }
        if (kept.length) {
            combined.push({
                type: "error",
                message: `The following ${kept.length > 1 ? "tags were" : "tag was"}n't deleted because ${kept.length > 1 ? "they" : "it"} didn't exist: ${kept.map(t => `\`${t}\``).join(", ")}`
            })
        }

        return msg.combine(combined);
    }
};