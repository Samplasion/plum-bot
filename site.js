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
    var dashboard = require('./dashboard.js');
    var port = process.env.PORT || 5000;
    var app = express();
    // ================================================================
    // setup our express application
    // ================================================================
    app.use('/public', express.static(process.cwd() + '/public'));
    app.set('view engine', 'ejs');
    // ================================================================
    // error handlers
    // ================================================================
    function errorHandler(err, req, res, next) {
        if (res.headersSent) {
          return next(err);
        }
        res.status(500);
        // res.render('error', { error: err });
    }
    
    function logoutAndError(err, req, res, next) {
        if (req.isAuthenticated()) {
            req.session.destroy(() => { // We destroy session
                req.logout(); // Inside callback we logout user
                res.redirect("/"); // And to make sure he isn't on any pages that require authorization, we redirect it to main page.
            });
        }
        res.render("pages/500", { user: null, error: "An unexpected error happened. You've been automatically logged out." });
    }

    app.use(errorHandler);
    app.use(logoutAndError);
    // ================================================================
    // set up modules
    // ================================================================
    app.locals.client = client;
    app.locals.util = util;
    app.locals.perm = require("jsdiscordperms").convertReadable;
    app.locals.md = require("marked");
    app.locals.render = (guild, string) => {
        string = string
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

        string = string.replace(/&lt;@!?(\d+)&gt;/g, (match, id) => {
            let user = client.users.resolve(id);
            let fancy = user ? "@" + user.username : `<@${id}>`;

            return `<span class="user mention">${fancy}</span>`
        })

        if (guild) {
            string = string.replace(/&lt;@&amp;(\d+)&gt;/g, (match, id) => {
                let role = guild.roles.resolve(id);
                let fancy = role ? "@" + role.name : `<@${id}>`;

                return `<span class="role mention" data-color="${role.hexColor}">${fancy}</span>`
            })
        }

        string = string.replace(/&lt;#(\d+)&gt;/g, (match, id) => {
            let chan = client.channels.resolve(id);
            let fancy = chan ? "#" + chan.name : `<#${id}>`;

            return `<span class="channel mention">${fancy}</span>`
        })
            
        string = app.locals.md(string);
        return string;
    }
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
    // ================================================================
    // setup routes
    // ================================================================
    dashboard(app, client, passport, session);
    routes(app, client, passport, session);
    // ================================================================
    // start our server
    // ================================================================
    app.listen(port, function () {
        console.log(' [SITE] Server listening on port ' + port + '…');
    });
}