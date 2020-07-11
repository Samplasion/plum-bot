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
    const http = require('http');
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
    // setup routes
    // ================================================================
    routes(app, client);
    // ================================================================
    // start our server
    // ================================================================
    app.listen(port, function () {
        console.log(' [SITE] Server listening on port ' + port + '…');
    });
}