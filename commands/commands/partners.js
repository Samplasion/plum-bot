const Command = require('./../../classes/Command.js');

module.exports = class PartnersCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'partners',
            aliases: [],
            group: 'commands',
            memberName: 'partners',
            description: "Shows other awesome projects.",
            args: []
        });
    }

    async run(msg) {
        if (msg.member.level.level < 9)
            return this.list(msg);
        else if (msg.flags.add)
            return this.add(msg);
        else if (msg.flags.edit || msg.flags.edit == 0)
            return this.edit(msg);
        else if (msg.flags.remove || msg.flags.remove == 0)
            return this.remove(msg);
        else return this.list(msg);
    }

    async add(msg) {
        if (!["name", "desc", "link", "author"].every(f => msg.flags[f]))
            return msg.error("The following flags must all be present: `name`, `desc`, `link`, `author`");
        
        this.client.partners.add({
            name: msg.flags.name,
            desc: msg.flags.desc,
            link: msg.flags.link,
            author: msg.flags.author,
        });

        return msg.ok(`The partner was added: ${msg.flags.name}`);
    }

    async edit(msg) {
        let index = msg.flags.edit;

        if (!this.client.partners.get(index))
            return msg.error(`There's no partner with ID \`${index}\`.`);

        let partner = this.client.partners.get(index);

        if (!msg.flag("name", "desc", "link", "author"))
            return msg.error("At least one of the following flags must be present: `name`, `desc`, `link`, `author`");
        
        this.client.partners.edit(index, {
            name: msg.flags.name || partner.name,
            desc: msg.flags.desc || partner.desc,
            link: msg.flags.link || partner.link,
            author: msg.flags.author || partner.author,
        });

        return msg.ok(`The partner was edited: ${msg.flags.name || partner.name}`);
    }

    async list(msg) {
        let raw = this.client.partners.data;

        if (!raw.length)
            return msg.info("No partners are registered so far!");

        let embeds = [];
        let fields = 5;
        let pages = Math.ceil(raw.length / fields);
        let e = this.client.utils.emojis;
        for (let i = 0; i < pages; i++) {
            let embed = this.client.utils.embed()
                .setTitle(`${e.info} Partner Projects`)
                .setDescription(`Page ${i+1} of ${pages}.\n\nThese awesome people have made even more awesome projects! I've collected them for your pleasure. Be sure to check them out!`);

            for (let partner of raw.slice(i * fields, i * fields + fields)) {
                embed.addField(`${msg.flag("id", "show-ids") && msg.member.level.level >= 9 ? `\`${partner.id}\`. ` : ""}${partner.name}`, `${partner.desc}\n\nMade by: **${partner.author}**\n[Go to project!](${partner.link})`);
            }

            embeds.push(embed);
        }
        
        return this.pagination(msg, embeds);
    }
};