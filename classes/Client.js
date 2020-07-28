const { CommandoClient, SQLiteProvider } = require("discord.js-commando")
const { Permissions } = require("discord.js")
const sqlite = require('sqlite')
const Enmap = require("enmap");
const path = require("path")

module.exports = class PlumClient extends CommandoClient {
    constructor() {
        super({
            commandPrefix: "pl.",
            // @ts-expect-error
            unknownCommandResponse: false,
            owner: ["280399026749440000"],
            invite: "https://discord.gg/MDtgmEM",
            fetchAllMembers: true,
            disableEveryone: true,
        });

        this.registry
            .registerDefaultTypes()
            .registerDefaultGroups({
                customEmoji: true
            })
            .registerGroups([
                ["audio", "Audio & Music"],
                ["commands", "Botkeeping Utilities"],
                ["moderation", "Moderation"],
                ["fun", "Fun"],
                ["imgman", "Image editing"],
            ])
            //.registerDefaultCommands({
            //  help: false,
            //  ping: false,
            //  reload: false
            //})
            .registerTypesIn(path.join(__dirname, '..', 'types'))
            .registerCommandsIn(path.join(__dirname, '..', 'commands'));

        sqlite.open(path.join(__dirname, '..', "settings.sqlite3")).then((db) => {
            this.setProvider(new SQLiteProvider(db));
        });

        const perms = require("../perms");

        this.permissionLevels = []
        perms.forEach(Perm => this.permissionLevels.push(new Perm(this)));

        this.permissions = (member) => {
            var p = this.permissionLevels[0]
            this.permissionLevels.forEach(perm => {
                if (perm.validate(member)) p = perm
            })
            return p;
        }
        // @ts-expect-error
        this.permissions.get = number => {
            return this.permissionLevels.filter(l => l.level == number)[0];
        };

        this.db = require('../utils/database.js');

        this.audio = require("../utils/audio");

        // this.points = new Enmap({ name: "points" })
        this.configs = new Enmap({ name: "settings" })

        this.reminders = new Enmap({ name: "reminders" });
        // @ts-expect-error
        this.reminders.add = (user, reminder) => {
            var old = this.reminders.has(user.id) ? this.reminders.get(user.id) : [];
            old.push(reminder);
            this.reminders.set(user.id, old);
        }
        // @ts-expect-error
        this.reminders.flush = () => {
            for (let [key, old] of this.reminders.entries()) {
                // @ts-expect-error
                old = old.filter(r => r.date > Date.now());
                this.reminders.set(key, old);
            }
        }
        // @ts-expect-error
        this.reminders.reset = (user) => {
            this.reminders.set(user.id, []);
        }
        // @ts-expect-error
        this.reminders.list = (user) => {
            return this.reminders.get(user.id);
        }
        // @ts-expect-error
        this.reminders.raw = {}

        this.global = new Enmap({ name: "global" });

        this.queues = new Enmap({ name: "queues" });

        this.money = new Enmap({ name: "money" });

        var Utilities = require("../classes/Utilities");
        this.utils = new Utilities(this);

        this.version = require("../version");

        // For the premium nag and stuff.
        this.commandsRan = new Map();

        this.usefulPerms = [
            Permissions.FLAGS.MANAGE_EMOJIS,
            Permissions.FLAGS.MANAGE_CHANNELS,
            Permissions.FLAGS.MANAGE_WEBHOOKS
        ];

        let _sra = require("sra-wrapper");
        this.sra = _sra;

        this.partners = {
            get db() {
                return require("../utils/database").partners;
            },
            get data() {
                return this.db.data;
            },
            add({ name, desc, link, author }) {
                let index = 0;
                if (this.data.length) {
                    index = this.data[this.data.length-1].id + 1;
                }

                this.db.insert({
                    name,
                    desc,
                    link,
                    author,
                    id: index
                });

                return this;
            },
            edit(id, { name, desc, link, author }) {
                let data = this.get(id);

                if (!data)
                    return this;

                if (name != data.name)
                    data.name = name;
                if (desc != data.desc)
                    data.desc = desc;
                if (link != data.link)
                    data.link = link;
                if (author != data.author)
                    data.author = author;

                this.db.update(data);

                return this;
            },
            get(id) {
                return this.data.filter(v => v.id == id)[0];
            }
        }
    }

    get color() {
        return parseInt(process.env.COLOR) || 0xC44040;
    }

    get invite() {
        let permissions = Array.from(this.registry.commands.values()).map(c => c.clientPermissions).flat().concat(this.usefulPerms).reduce((prev, this_) => {
            if (!this_) return prev;
            return new Permissions(prev).add(this_);
        }, new Permissions()).bitfield;
		return `https://discordapp.com/oauth2/authorize?client_id=${this.user.id}&permissions=${permissions}&scope=bot`;
	}
}