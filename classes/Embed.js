const { MessageEmbed } = require("discord.js");

module.exports = class PlumEmbed extends MessageEmbed {
    constructor(client, ...args) {
        super(...args);
        this.setFooter("");
        this.setColor(client.color);
        this.setAuthor(client.user.username, client.user.avatarURL());

        /** @type {import("./Client")} */
        this.client = client;
    }

    addInline(name, body) {
        return this.addField(name, body, true);
    }

    /**
    * 
    * @param {*} name 
    * @param {*?} icon 
    */
    setFooter(name, icon = "") {
        return this.setFullFooter((name ? name + " • " : "") + `Plum is made by Samplasion#0325`, icon);
    }

    /**
    * 
    * @param {*} name 
    * @param {*?} icon 
    */
    setFullFooter(name, icon = "") {
        return super.setFooter(name, icon);
    }

    textRepresentation() {
        return PlumEmbed.textRepresentation(this, this.client);
    }

    /** @type {PlumEmbed} */
    static textRepresentation(embed, client) {
        let string = "";

        if (embed.title)
            string += `__**${embed.title}**__\n\n`;

        if (embed.description)
            string += `${embed.description}\n\n`;

        for (let field of embed.fields) {
            string += `**${field.name}**\n${field.value}\n\n`
        }

        if (embed.footer && embed.footer.text)
            string += `_${embed.footer.text}_`;
            if (embed.timestamp)
                string += " • ";

        if (embed.timestamp)
            string += client.utils.fmtDate(new Date(embed.timestamp));

        return string;
    }

    addFieldE(emojiName, name, description, inline = false) {
        return this.addField(`${this.client.utils.emojis[emojiName]} ${name}`, description, inline);
    }

    addFieldsE(emojiName, fields) {
        return this.addFields(fields.map(f => {
            f.name = `${this.client.utils.emojis[emojiName]} ${f.name}`;
            return f;
        }))
    }
}