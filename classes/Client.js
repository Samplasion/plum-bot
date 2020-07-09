const { CommandoClient, SQLiteProvider } = require("discord.js-commando")
const { GuildMember } = require("discord.js")
const sqlite = require('sqlite')
const Enmap = require("enmap");
const path = require("path")

module.exports = class PlumClient extends CommandoClient {
    constructor() {
        super({
            commandPrefix: "pl.",
            // @ts-expect-error
            unknownCommandResponse: false,
            owner: ["280399026749440000", "413378420236615680"],
            invite: "https://discord.gg/MDtgmEM",
            fetchAllMembers: true,
            disableEveryone: true,
        });

        this.registry
            .registerDefaultTypes()
            .registerDefaultGroups()
            .registerGroups([
                ["audio", "Audio & Music"],
                ["commands", "Botkeeping Utilities"],
                ["moderation", "Moderation"],
                ["fakemod", "Mooderatyon"],
                ["fun", "Fun"],
            ])
            //.registerDefaultCommands({
            //  help: false,
            //  ping: false,
            //  reload: false
            //})
            .registerCommandsIn(path.join(__dirname, '..', 'commands'));

        sqlite.open(path.join(__dirname, '..', "settings.sqlite3")).then((db) => {
            this.setProvider(new SQLiteProvider(db));
        });

        const perms = require("../perms");
        const Permission = require("./Permission");

        /** @type {Permission[]} */
        this.permissionLevels = []
        perms.forEach(Perm => this.permissionLevels.push(new Perm(this)));

        /**
         * @param {GuildMember} member 
         */
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

        this.points = new Enmap({ name: "points" })
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

        var Utilities = require("../classes/Utilities");
        this.utils = new Utilities(this);

        this.version = require("../version");
    }
}