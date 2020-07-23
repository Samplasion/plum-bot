const { MessageEmbed } = require("discord.js");

module.exports = class PlumEmbed extends MessageEmbed {
    constructor(client, ...args) {
        super(...args);
        this.setFooter("");
        this.setColor(client.color);
        this.setAuthor(client.user.username, client.user.avatarURL());
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
        let string = "";

        if (this.title)
            string += `__**${this.title}**__\n\n`;

        if (this.description)
            string += `${this.description}\n\n`;

        for (let field of this.fields) {
            string += `**${field.name}**\n${field.value}\n\n`
        }

        if (this.footer && this.footer.text)
            string += `_${this.footer.text}_`;
            if (this.timestamp)
                string += " • ";

        if (this.timestamp)
            string += this.fmtDate(new Date(this.timestamp));

        
        return string;
    }

    pad(n) {
        return n < 10 ? "0" + n : n;
    }

    fmtDate(date) {
        return `${date.getFullYear()}/${this.pad(date.getMonth()+1)}/${this.pad(date.getDate())} ${this.pad(date.getHours())}:${this.pad(date.getMinutes())}:${this.pad(date.getSeconds())}`
    }
}