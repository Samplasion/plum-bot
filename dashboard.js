module.exports = (app, client, passport, session) => {
    const dash = (req, res, template, data = {}) => {
        // Default base data which passed to the ejs template by default. 
        const baseData = {
            bot: client,
            path: req.path,
            user: req.isAuthenticated() ? req.user : null,
            user_: req.isAuthenticated() && client.users.cache.has(req.user.id) ? client.users.cache.get(req.user.id) : null
        };
        // We render template using the absolute path of the template and the merged default data with the additional data provided.
        res.render(`pages/dashboard/${template}`, Object.assign(baseData, data));
    };

    app.get("/dashboard/login", (req, res, next) => {
        if (req.session.backURL) { // We check if there a return URL has been set prior redirecting/accesing.
        /* Return URL is the url that user will be redirected to after login. */
            // eslint-disable-next-line no-self-assign
            req.session.backURL = req.session.backURL;
        } else { // If there is no return URL we simply set it to index page.
            req.session.backURL = "/";
        }
        // Now that we have configured the returning URL, we can let passport redirect user to appropriate auth page.
        next();
    }, passport.authenticate("discord"));

    // Here passport takes data returned from discord and we redirect user accordingly.
    app.get("/dashboard/callback", passport.authenticate("discord", { failureRedirect: "/" }), (req, res) => { // Passport collects data that discord has returned and if user aborted auhorization it redirects to '/'
        session.us = req.user;
        if (req.session.backURL) { // If there is a returning url we redirect user to it.
            const url = req.session.backURL;
            req.session.backURL = null; // We change returning url to null for little more performance.
            res.redirect(url);
        } else { // If there still isn't we won't leave user alone and stuck so well redirect it to index page.
            res.redirect("/");
        }
    });

    app.get("/dashboard/logout", function (req, res) {
        req.session.destroy(() => { // We destroy session
            req.logout(); // Inside callback we logout user
            res.redirect("/"); // And to make sure he isn't on any pages that require authorization, we redirect it to main page.
        });
    });

    const authenticate = (req, res, next) => {
        if (req.isAuthenticated()) return next(); // If the user is logged in, we skip execution of the rest of the code in this function and let the code for te route run.
        req.session.backURL = req.url; // If execution reached this point, means that user is not logged in and we can set the return url to the current url.
        res.redirect("/dashboard/login"); // And we redirect it to our login handler that will do the job.
    };

    app.get("/dashboard", authenticate, (req, res) => { // We set the route so server handles request by running this code.
        dash(req, res, "index.ejs");
    });

    const hasGuild = async (req, res, next) => {
        const guild = client.guilds.cache.get(req.params.guildID);
        if (!guild) return res.redirect("/dashboard");
        await guild.members.fetch();
        const member = guild.members.cache.get(req.user.id);
        if (!member) return res.redirect("/dashboard");

        res.locals.guild = guild;
        res.locals.member = member;

        next();
    }

    app.get("/dashboard/:guildID/home", authenticate, hasGuild, async (req, res) => {

        dash(req, res, "dashboard.ejs", { 
            guild: res.locals.guild,
            alert: null
        });
    });

    app.get("/dashboard/:guildID/leaderboard", authenticate, hasGuild, async (req, res) => {
        dash(req, res, "leaderboard/index.ejs", { 
            guild: res.locals.guild,
            alert: null
        });
    });

    app.get("/dashboard/:guildID/config/edit", authenticate, hasGuild, async (req, res) => {
        if (res.locals.member.level.level < 3) return res.redirect("/dashboard");

        // We retrive the settings stored for this guild.
        var storedSettings = res.locals.guild.config.fix();
        if (!storedSettings) {
        // If there are no settings stored for this guild, we create them and try to retrive them again.
            storedSettings = res.locals.guild.config.data;
        }

        let { types, settingProps } = require("./settings");
        dash(req, res, "config/edit.ejs", { 
            guild: res.locals.guild,
            settings: storedSettings, 
            types,
            settingProps,
            alert: null
        });
    });
    
    app.get("/dashboard/:guildID/config/view", authenticate, hasGuild, async (req, res) => {
        if (res.locals.member.level.level < 3) return res.redirect("/dashboard");

        // We retrive the settings stored for this guild.
        var storedSettings = res.locals.guild.config.fix();
        if (!storedSettings) {
        // If there are no settings stored for this guild, we create them and try to retrive them again.
            storedSettings = res.locals.guild.config.data;
        }

        let { types, settingProps } = require("./settings");
        dash(req, res, "config/view.ejs", { 
            guild: res.locals.guild,
            settings: storedSettings, 
            types,
            settingProps,
            alert: null
        });
    });

    app.post("/dashboard/:guildID/config/save", authenticate, hasGuild, async (req, res) => {
        if (res.locals.member.level.level < 3) return res.redirect("/dashboard");

        let { types, settingProps } = require("./settings");

        function getType(key) {
            return types.filter(t => !!settingProps[key] && settingProps[key].type == t.id)[0];
        }

        let settings = req.body;
        console.log(settings, settings.levelupmsgs);
        for (let setting of Object.keys(settingProps)) {
            let type = getType(setting);
            if (settingProps[setting].extendable) {
                let arr = [];
                if (settings[setting]) {
                    settings[setting].forEach(set => {
                        arr.push(type.webSerialize(client, res.locals.guild, set));
                    });
                }
                res.locals.guild.config.set(setting, arr);
            } else {
                console.log(type.id);
                if (type.id == "bool" && !settings[setting]) {
                    console.log("ayy");
                    res.locals.guild.config.set(setting, type.webSerialize(client, res.locals.guild, undefined));
                } else res.locals.guild.config.set(setting, type.webSerialize(client, res.locals.guild, settings[setting]));
            }
        }

        res.redirect(`/dashboard/${res.locals.guild.id}/home`);
    })
    
    app.get("/dashboard/:guildID/tags/view", authenticate, hasGuild, async (req, res) => {
        if (res.locals.member.level.level < 3) return res.redirect("/dashboard");

        dash(req, res, "tags/view.ejs", {
            guild: res.locals.guild,
            alert: null
        });
    });
    
    app.get("/dashboard/:guildID/tags/edit", authenticate, hasGuild, async (req, res) => {
        if (res.locals.member.level.level < 3) return res.redirect("/dashboard");

        dash(req, res, "tags/edit.ejs", {
            guild: res.locals.guild,
            alert: null
        });
    });

    app.post("/dashboard/:guildID/tags/save", authenticate, hasGuild, async (req, res) => {
        if (res.locals.member.level.level < 3) return res.redirect("/dashboard");

        // Remove the outdated tags
        // There's probably a far better way to do this
        res.locals.guild.tags.list.map(t => t.name).forEach(n => res.locals.guild.tags.remove(n));

        let b = req.body;
        
        b && b.tags && b.tags.forEach((_, i) => {
            res.locals.guild.tags.add(b.tags[i], b.bodies[i]);
        });

        res.redirect(`/dashboard/${res.locals.guild.id}/home`);
    })

    app.post("/dashboard/:guildID/config/prefix", authenticate, hasGuild, async (req, res) => {
        if (res.locals.member.level.level < 3) return res.redirect("/dashboard");

        console.log(req.body);
        res.locals.guild.commandPrefix = !req.body.prefix || req.body.prefix.toLowerCase() == "none" ? client.commandPrefix : req.body.prefix;

        res.redirect(`/dashboard/${res.locals.guild.id}/home`);
    })

    // USER DASHBOARD
    userDashboard(app, client, passport, session);
}

function userDashboard(app, client, passport, session) {
    const r = (req, res, template, data = {}) => {
        // Default base data which passed to the ejs template by default. 
        const baseData = {
            bot: client,
            path: req.path,
            user: req.isAuthenticated() && client.users.cache.has(req.user.id) ? client.users.cache.get(req.user.id) : null
        };
        // We render template using the absolute path of the template and the merged default data with the additional data provided.
        res.render(`pages/dashboard/usersettings/${template}`, Object.assign(baseData, data));
    };

    app.get("/user/settings", (req, res) => {
        r(req, res, "index");
    })
}