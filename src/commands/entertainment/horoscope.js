const Command = require('../../classes/commands/Command.js');
const cheerio = require("cheerio");
const phin = require("phin");
const signs = asset("json", "zodiac.json");

module.exports = class HoroscopeCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'horoscope',
            aliases: [],
            group: 'entertainment',
            memberName: 'horoscope',
            description: "Read your (chinese) horoscope for today",
            format: "[sign] (--yesterday|--tomorrow) [--chinese|--ch]",
            formatExplanation: {
                "[sign]": "Your zodiac sign. You don't need it if you've set it in the [user dashboard](" + process.env.DOMAIN + "/user)",
                "(--yesterday)": "See the horoscope for yesterday instead of today",
                "(--tomorrow)": "See the horoscope for tomorrow instead of today",
                "[--chinese|--ch]": "If specified, gets the Chinese horoscope."
            },
            args: [{
                key: "sign",
                isEmpty: (val, msg, arg) => {
                    return msg.client.registry.types.get(`${msg.flag("chinese", "ch") ? "ch-" : ""}zodiac`).isEmpty(val, msg, arg)
                },
                validate: (val, msg, arg) => {
                    return msg.client.registry.types.get(`${msg.flag("chinese", "ch") ? "ch-" : ""}zodiac`).validate(val, msg, arg)
                },
                parse: (val, msg, arg) => {
                    return msg.client.registry.types.get(`${msg.flag("chinese", "ch") ? "ch-" : ""}zodiac`).parse(val, msg, arg)
                },
                default: "",
                prompt: ""
            }]
        });
    }

    async run(msg, { sign }) {
        let c = msg.flag("chinese", "ch");
        let day = "today";
        if (msg.flag("yesterday"))
            day = "yesterday";
        if (msg.flag("tomorrow"))
            day = "tomorrow";
        
        let zodiac = msg.author.config.get(c ? "ch-zodiac" : "zodiac");
        if (!zodiac || sign) {
            zodiac = sign;
        }
        if (!zodiac) {
            return msg.combine([
                {
                    message: `You must specify a ${c ? "chinese " : c}zodiac sign!`,
                    type: "error"
                },
                {
                    message: `If you don't want to do that now, you can set up yours in the configuration page.\n${process.env.DOMAIN}/user`,
                    type: "info"
                }
            ]);
        }

        let url = `https://www.astrology.com/horoscope/daily${c ? "-chinese" : ""}/${day}/${zodiac}.html`;
        let { body } = await phin(url);
        let $ = cheerio.load(body);
        let raw = $(c ? `body > section.horoscope.horoscope--chinese > div.daily-horoscope > div > p:nth-child(3)` : `body > section > section > div.horoscope-main.grid.grid-right-sidebar.primis-rr > main > p:nth-child(7)`).text();
        let split = raw.split(":");
        let [date, text] = [split[0], split.slice(1).join(":").trim()];

        let e = msg.makeEmbed()
            .setDescription(text)
            .setTitle(`${this.client.utils.emojis.zodiac[c ? "chinese" : "western"][zodiac]} ${this.client.utils.titleCase(zodiac)}`.trim())
            .setFullFooter(`${c ? "Chinese h" : "H"}oroscope of`)
            .setTimestamp(new Date(date).toISOString())

        msg.channel.send(e)
    }
};