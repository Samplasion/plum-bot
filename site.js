// const express = require("express");
// const app = express();
// const path = require("path");
// app.get("/", (req, res) => {
//     return res.sendFile(path.join(__dirname, "public", "index.html"));
// });
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server Running on Port ${PORT}`));

/** @param {import("./classes/Client.js")} client */
module.exports = function server(client) {
    const util = require("util");
    // ================================================================
    // get all the tools we need
    // ================================================================
    var express = require('express');
    var routes = require('./routes.js');
    var port = process.env.PORT || 5000;
    var app = express();
    // ================================================================
    // setup our express application
    // ================================================================
    app.use('/public', express.static(process.cwd() + '/public'));
    app.set('view engine', 'ejs');
    // ================================================================
    // set up modules
    // ================================================================
    app.locals.client = client;
    app.locals.util = util;
    app.locals.perm = require("jsdiscordperms").convertReadable;
    app.locals.md = require("marked");
    /** @param {string} query */
    app.locals.getParams = query => {
        return query ?
            (/^[?#]/.test(query) ? query.slice(1) : query)
            .split('&')
            .reduce((params, param) => {
                let [key, value] = param.split('=');
                // @ts-ignore
                params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
                return params;
            }, {}) :
            {}
    };
    app.locals.require = require;
    // ================================================================
    // setup passport
    // ================================================================
    const dash = (req, res, template, data = {}) => {
        // Default base data which passed to the ejs template by default. 
        const baseData = {
            bot: client,
            path: req.path,
            user: req.isAuthenticated() ? req.user : null
        };
        // We render template using the absolute path of the template and the merged default data with the additional data provided.
        res.render(`pages/dashboard/${template}`, Object.assign(baseData, data));
    };
    const session = require("express-session");
    const MemoryStore = require("memorystore");
    const mStore = MemoryStore(session);
    app.use(session({
        store: new mStore({ checkPeriod: 86400000 }), // we refresh the store each day
        secret: process.env.CLIENT_SECRET.repeat(12),
        saveUninitialized: true,
        resave: true,
    }));

    const passport = require("passport"); // The general passport module.
    const passportDiscord = require("passport-discord"); // This will allow us to solve the output from OAuth.
    const Strategy = passportDiscord.Strategy; // This will solve the actual output.
    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((obj, done) => {
        done(null, obj);
    });
    
    const strategy = new Strategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.DOMAIN + "/dashboard/callback", // The url that will handle callbacks.
        scope: ["identify", "guilds"] // Get tag and profile picture + servers user is in.
    },
    (accessToken, refreshToken, profile, done) => {
        process.nextTick(() => done(null, profile));
    });

    passport.use(strategy);
    app.use(passport.initialize());
    app.use(passport.session());
    var bodyParser = require("body-parser");
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    // Web Dashboard
    app.get("/dashboard/login", (req, res, next) => {
        if (req.session.backURL) { // We check if there a return URL has been set prior redirecting/accesing.
        /* Return URL is the url that user will be redirected to after login. */
            // eslint-disable-next-line no-self-assign
            req.session.backURL = req.session.backURL;
        } else { // If there is no return URL we simply set it to index page.
            req.session.backURL = "/dashboard";
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

    app.get("/dashboard/:guildID/home", authenticate, async (req, res) => {
        const guild = client.guilds.cache.get(req.params.guildID);
        if (!guild) return res.redirect("/dashboard");
        await guild.members.fetch();
        const member = guild.members.cache.get(req.user.id);
        if (!member) return res.redirect("/dashboard");

        dash(req, res, "dashboard.ejs", { 
            guild,
            alert: null
        });
    });

    app.get("/dashboard/:guildID/leaderboard", authenticate, async (req, res) => {
        const guild = client.guilds.cache.get(req.params.guildID);
        if (!guild) return res.redirect("/dashboard");
        await guild.members.fetch();
        const member = guild.members.cache.get(req.user.id);
        if (!member) return res.redirect("/dashboard");

        dash(req, res, "leaderboard/index.ejs", { 
            guild,
            alert: null
        });
    });

    app.get("/dashboard/:guildID/config/edit", authenticate, async (req, res) => {
        // We validate the request, check if guild exists, member is in guild and if member has minimum permissions, if not, we redirect it back.
        const guild = client.guilds.cache.get(req.params.guildID);
        if (!guild) return res.redirect("/dashboard");
        await guild.members.fetch();
        const member = guild.members.cache.get(req.user.id);
        if (!member) return res.redirect("/dashboard");
        if (member.level.level < 3) return res.redirect("/dashboard");

        // We retrive the settings stored for this guild.
        var storedSettings = guild.config.fix();
        if (!storedSettings) {
        // If there are no settings stored for this guild, we create them and try to retrive them again.
            storedSettings = guild.config.data;
        }

        let { types, settingProps } = require("./settings");
        dash(req, res, "config/edit.ejs", { 
            guild,
            settings: storedSettings, 
            types,
            settingProps,
            alert: null
        });
    });
    
    app.get("/dashboard/:guildID/config/view", authenticate, async (req, res) => {
        // We validate the request, check if guild exists, member is in guild and if member has minimum permissions, if not, we redirect it back.
        const guild = client.guilds.cache.get(req.params.guildID);
        if (!guild) return res.redirect("/dashboard");
        await guild.members.fetch();
        const member = guild.members.cache.get(req.user.id);
        if (!member) return res.redirect("/dashboard");
        if (member.level.level < 3) return res.redirect("/dashboard");

        // We retrive the settings stored for this guild.
        var storedSettings = guild.config.fix();
        if (!storedSettings) {
        // If there are no settings stored for this guild, we create them and try to retrive them again.
            storedSettings = guild.config.data;
        }

        let { types, settingProps } = require("./settings");
        dash(req, res, "config/view.ejs", { 
            guild,
            settings: storedSettings, 
            types,
            settingProps,
            alert: null
        });
    });

    app.post("/dashboard/:guildID/config/save", authenticate, async (req, res) => {
        const guild = client.guilds.cache.get(req.params.guildID);
        if (!guild) return res.redirect("/dashboard");
        await guild.members.fetch();
        const member = guild.members.cache.get(req.user.id);
        if (!member) return res.redirect("/dashboard");
        if (member.level.level < 3) return res.redirect("/dashboard");

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
                        arr.push(type.webSerialize(client, guild, set));
                    });
                }
                guild.config.set(setting, arr);
            } else {
                console.log(type.id);
                if (type.id == "bool" && !settings[setting]) {
                    console.log("ayy");
                    guild.config.set(setting, type.webSerialize(client, guild, undefined));
                } else guild.config.set(setting, type.webSerialize(client, guild, settings[setting]));
            }
        }

        res.redirect(`/dashboard/${guild.id}/home`);
    })

    app.post("/dashboard/:guildID/config/prefix", authenticate, async (req, res) => {
        const guild = client.guilds.cache.get(req.params.guildID);
        if (!guild) return res.redirect("/dashboard");
        await guild.members.fetch();
        const member = guild.members.cache.get(req.user.id);
        if (!member) return res.redirect("/dashboard");
        if (member.level.level < 3) return res.redirect("/dashboard");

        guild.commandPrefix = !req.body.prefix || req.body.prefix.toLowerCase() == "none" ? client.commandPrefix : req.body.prefix;

        res.redirect(`/dashboard/${guild.id}/home`);
    })
    // ================================================================
    // setup routes
    // ================================================================
    routes(app, client, passport, session);
    // ================================================================
    // start our server
    // ================================================================
    app.listen(port, function () {
        console.log(' [SITE] Server listening on port ' + port + '…');
    });
}