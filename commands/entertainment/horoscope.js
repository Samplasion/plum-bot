const Command = require('./../../classes/Command.js');
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
            description: "Read your horoscope for today",
            format: "[sign] (--yesterday|--tomorrow)",
            details: `The sign is a zodiac sign. If you don't know them, they're: ${client.utils.oxford(signs.map(client.utils.titleCase))}.`,
            formatExplanation: {
                "[sign]": "Your zodiac sign. You don't need it if you've set it in the [user dashboard](" + process.env.DOMAIN + "/user)",
                "(--yesterday)": "See the horoscope for yesterday instead of today",
                "(--tomorrow)": "See the horoscope for tomorrow instead of today"
            },
            args: [{
                key: "sign",
                type: "zodiac",
                default: "",
                prompt: ""
            }]
        });
    }

    async run(msg, { sign }) {
        let day = "today";
        if (msg.flag("yesterday"))
            day = "yesterday";
        if (msg.flag("tomorrow"))
            day = "tomorrow";
        
        let zodiac = msg.author.config.get("zodiac");
        if (!zodiac || sign) {
            zodiac = sign;
        }
        if (!zodiac) {
            return msg.combine([
                {
                    message: "You must specify a zodiac sign!",
                    type: "error"
                },
                {
                    message: `If you don't want to do that now, you can set up yours in the configuration page.\n${process.env.DOMAIN}/user`,
                    type: "info"
                }
            ]);
        }

        let url = `https://www.astrology.com/horoscope/daily/${day}/${zodiac}.html`;
        let { body } = await phin(url);
        let $ = cheerio.load(body);

        let raw = $(`body > section > section > div.horoscope-main.grid.grid-right-sidebar.primis-rr > main > p:nth-child(7)`).text();
        let split = raw.split(":");
        let [date, text] = [split[0], split.slice(1).join(":").trim()]

        let e = msg.makeEmbed()
            .setDescription(text)
            .setTitle(`${this.client.utils.emojis.zodiac[zodiac]} ${this.client.utils.titleCase(zodiac)}`)
            .setFullFooter("Horoscope of")
            .setTimestamp(new Date(date).toISOString())

        msg.channel.send(e)
    }
};