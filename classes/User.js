const { findType } = require('../settings/user/index.js');
const { Structures } = require('discord.js');

// This extends Discord's native Guild class with our own methods and properties
// @ts-ignore
module.exports = Structures.extend( 'User', (User) =>
    class PlumUser extends User {
        // @ts-expect-error
        constructor(...args) {
            super(...args);

            let client = this.client;
            let user = this;

            this.reminders = {
                get list() {
                    return client.reminders.list(user) || [];
                },
                /** @param {Object} reminder */
                add: (reminder) => {
                    return client.reminders.add(user, reminder);
                },
                flush: () => {
                    return client.reminders.flush(user);
                },
                clear: () => {
                    return client.reminders.clear(user);
                },
                /** @param {number} index */
                delete: function (index) {
                    // @ts-expect-error
                    if (
                        index >= 0 &&
                        this.list.map((rem) => rem.id).includes(index)
                    ) {
                        var old = this.list;
                        // @ts-expect-error
                        let spliced = old.splice(
                            this.list.map((rem) => rem.id).indexOf(index),
                            1
                        );
                        console.log(spliced);
                        let id = spliced[0].id;
                        clearTimeout(client.reminders.raw[user.id][id]);
                        client.reminders.set(user.id, old);
                        return true;
                    }
                    return false;
                },
            };

            this.swears = {
                get db() {
                    return require("../utils/database").swears;
                },
                get data() {
                    try {
                        return this.db.data.filter(d => {
                            return d.user == user.id;
                        });
                    } catch {
                        return [];
                    }
                },
                add(msg) {
                    let index = 0;
                    if (this.data.length) {
                        index = this.data[this.data.length-1].id + 1;
                    }

                    this.db.insert({
                        user: user.id,
                        content: msg.content,
                        id: index,
                        date: msg.createdTimestamp,
                        forgiven: false,
                        forgivenBy: null,
                        matches: msg.swear || []
                    });

                    return this;
                },
                forgive(msg, id) {
                    let data = this.data.filter(d => {
                        return d.id == id
                    })[0];

                    if (!data)
                        return this;

                    data.forgiven = true;
                    data.forgivenBy = msg.author.id;

                    this.db.update(data);

                    return this;
                }
            }

            this.DBinit();
        }

        DBinit() {
            let user = this;
            this.config = {
                get db() {
                    return require("../utils/database").usersettings
                },
                get data() {
                    try {
                        let r = this.db.data.filter(d => {
                            return d.user == user.id;
                        })[0] || this.setDefaultSettings();
                        return r[0] || r;
                    } catch (e) {
                        return this.setDefaultSettings();
                    }
                },
                getDefaults() {
                    let zodiac = "";
    
                    return {
                        user: user.id,
                        zodiac,
                        'ch-zodiac': zodiac
                    };
                },
                setDefaultSettings() {
                    let defaultSettings = this.getDefaults();
    
                    let currentsettings = this.db.data.filter(d => {
                        return d.user == user.id;
                    })[0];
                    if (currentsettings) {
                        for (var key in defaultSettings) {
                            currentsettings[key] = defaultSettings[key];
                        }
    
                        this.db.update(currentsettings);
                        return currentsettings;
                    }
    
                    this.db.insert(defaultSettings);
                    return defaultSettings;
                },
                get(key) {
                    this.fix();
                    return findType(key).deserialize(user.client, { guild: user }, this.data[key]);
                },
                set(key, newValue) {
                    let currentsettings = this.data;
                    currentsettings[key] = newValue;
    
                    this.db.update(currentsettings);
                    return this;
                },
                render(key) {
                    let data = this.data;
                    let value = data[key];
    
                    return findType(key).deserialize(user.client, { guild: user }, value);
                },
                fix(data) {
                    let def = this.getDefaults();
                    if (!user) return def;
                    let returns = {};
                    let overrides = data ? data : (this.data || {});
                    for (let key in def) {
                        returns[key] = overrides[key] || def[key]; // For every key that's not there, use the default one
                    }
                    returns.$loki = overrides.$loki;
                    returns.meta = overrides.meta;
                    console.log(def, overrides, returns);
                    if (returns.$loki)
                        this.db.update(returns);
                    return returns;
                }
            }
        }

        get level() {
            return this.client.permissionLevels.filter(
                (i) => i.level == (this.client.isOwner(this) ? 10 : 1)
            )[0];
        }

        get money() {
            return this.client.money.ensure(this.id, 0);
        }

        set money(qty) {
            this.client.money.set(this.id, qty);
        }

        /**
            * Returns `true` if the member is in the Server and either
            * has the Premium role or has boosted the server.
            */
        get isPremium() {
            let member = this.client.guilds.cache
                .get('689149132371263604')
                .members.resolve(this);
            // Returns true if the member is in the Server and either
            // has the Premium role or has boosted the server.
            return (
                member &&
                (member.roles.cache.has('730500262204014644') ||
                    !!member.premiumSince)
            );
        }

        get maxLevel() {
            return this.client.guilds.cache.filter(g => {
                return !!g.members.resolve(this.id);
            }).map(g => {
                return g.members.resolve(this.id).level;
            }).sort((a, b) => {
                return b.level - a.level
            })[0];
        }
    }
);
