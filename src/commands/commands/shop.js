const Command = require('../../classes/commands/Command');

module.exports = class MoneyCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'shop',
            group: 'commands',
            memberName: 'shop',
            description: 'Lets you spend your money.',
            examples: ['shop list', "shop buy 1"],
            formatExplanation: {
                "[action]": "Either `list` or `buy` (defaults to `list`)",
                "[index]": "The index for the `buy` action."
            },

            args: [
                {
                    key: "action",
                    type: "string",
                    prompt: "",
                    oneOf: ["list", "buy"],
                    default: "list"
                },
                {
                    key: "index",
                    validate: arg => !isNaN(arg),
                    parse: arg => arg,
                    default: "",
                    prompt: ""
                }
            ]
        });

        delete require.cache[require.resolve("../../shop.js")];
        this.items = require("../../shop.js");
    }

    run(msg, { action, index }) {
        if (!this.client.guilds.cache.get("689149132371263604").members.resolve(msg.author) || !this.items.length) {
            return msg.channel.send(
                this.client.utils.fastEmbed("Shop", "The shop is closed. You can open it [by joining here](" + this.client.options.invite + ").")
            );
        }
        if (!this.argsCollector.args[0].oneOf.includes(action)) {
            return msg.error(`This command accepts an argument that may be either ${this.client.utils.oxford(this.argsCollector.args[0].oneOf.map(a => `\`${a}\``)).replace("and", "or")}.`);
        }
        return this[action](msg, parseInt(index));
    }

    list(msg) {
        let e = this.client.utils.fastEmbed("Shop", `To buy something, type \`${msg.prefix}shop buy <index>\`.`);
        for (let item of this.items) {
            e.addField(this.items.indexOf(item) + 1 + ". " + item.name, "$" + item.cost);
        }
        return msg.channel.send(e);
    }

    async buy(msg, index) {
        index = index - 1;
        if (index < 0 || index >= this.items.length) {
            return msg.error(`The index must be included between 1 and ${this.items.length}.`)
        }

        let item = this.items[index];

        if (item.cost > msg.author.money)
            return msg.error(`You don't have enough money! Consult ${msg.prefix}**money** to know how to gain money.`);
        
        let valid = await item.validate(this.client, msg);
        if (valid != true) {
            console.log(valid);
            if (typeof valid == "string" && !!valid)
                return msg.error(`You aren't eligible for this item: ${valid}`);
            return msg.error("You aren't eligible for this item!");
        }

        let ask = await msg.member.ask(msg.channel, `Are you sure you want to buy **${item.name}** for $${item.cost}?`);
        if (ask) {
            msg.author.money -= item.cost;
            item.onBuy(this.client, msg);
            return msg.ok(`You successfully bought **${item.name}**.`);
        } else return msg.info("Action canceled.");
    }
};