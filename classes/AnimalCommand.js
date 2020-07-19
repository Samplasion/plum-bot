const Command = require('./Command.js');
const { api } = require("some-random-api");

module.exports = class AnimalCommand extends Command {
    constructor(client, name, mem = name, api = name) {
        super(client, {
            name,
            group: 'fun',
            memberName: mem || name,
            description: "Sends a cute image of a " + name,
        });

        this.name = name;
        this.api = api || name;
    }

    async run(msg) {
        let { link } = await api.img[this.api]();
        let { fact } = await api.facts[this.api == "birb" ? "bird" : this.api]();

        let embed = this.client.utils.embed()
            .setImage(link)
            .setTitle(`Here's your ${this.name}!`)
            .setFullFooter(`Did you know? ${fact}`);
        msg.channel.send(embed);
    }
};