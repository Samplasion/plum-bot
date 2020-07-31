const { readFileSync } = require("fs");

/**
 * @param {import("express").Application} app 
 * @param {import("./classes/Client")} client
 */
module.exports = function (app, client) {
    function render(req, res, link, stuff) {
        let d = {
            user: client.users.cache.get(( req.user || { id: null } ).id) || null,
            ...stuff
        };
        d.user_ = d.user;
        return res.render(`pages/${link}`, d)
    }
    app.get("/", (req, res) => {
        render(req, res, "newindex")
    })
    app.get("/commands", (req, res) => {
        render(req, res, "commands")
    })
    app.get("/commands/:command", (req, res) => {
        let cmds = client.registry.findCommands(req.params.command, false, undefined);
        if (!cmds.length) return res.status(404).render("pages/404");
        render(req, res, "command", { cmd: cmds[0] });
    })
    app.get("/support", (req, res) => {
        render(req, res, "donate")
    })
    app.get("/about", (req, res) => {
        render(req, res, "about")
    })
    app.get("/server", (req, res) => {
        res.redirect(client.options.invite);
    })

    // Webhooks
    app.use("/wh/gbl", (req, res) => {
        if (req.body.auth !== process.env.API_PW) {
            res.status(401);
            delete req.body.auth;
            return res.json({ invalidauth: true });
        }
        delete req.body.auth;
        client.emit('botlistVote', { id: req.body.id, list: "Glenn Bot List" });
        res.status(200);
        return res.json({ good: true });
    })
    app.use("/wh/blspace", (req, res) => {
        if (req.headers.authorization !== process.env.BLSPACE_AUTH) {
            res.status(401);
            return res.json({ invalidauth: true });
        }
        // delete req.body.auth;
        // console.log(req.body, req.headers);
        client.emit('botlistVote', { id: req.body.user.id, list: "botlist.space" });
        res.status(200);
        return res.json({ good: true });
    })
    app.use("/wh/bfd", (req, res) => {
        if (req.headers.authorization != process.env.API_PW) {
            res.status(401);
            return res.json({ invalidauth: true });
        }
        // delete req.body.auth;
        // console.log(req.body, req.headers);
        client.emit('botlistVote', { id: req.body.user, list: "Bots for Discord" });
        res.status(200);
        return res.json({ good: true });
    })
    app.use("/wh/test", (req, res) => {
        console.log(req.body, req.headers);
        res.status(200);
        return res.json({ good: true });
    });

    app.get("/login", (req, res) => {
        res.redirect("/dashboard/login")
    }).get("/logout", (req, res) => {
        res.redirect("/dashboard/logout")
    })

    // Custom CSS
    app.get("/public/resources/css/style.css", (req, res) => {
        let color = `#${client.color.toString(16).toUpperCase()}`;
        let file = readFileSync("./public/resources/css/main.css").toString();
        file = file.split("##COLOR##").join(color);
        res.header("content-type", "text/css").send(file);
    });
    app.get("/public/resources/assets/wave.svg", (req, res) => {
        let color = `#${client.color.toString(16).toUpperCase()}`;
        let file = readFileSync("./public/resources/assets/wavy-color-by-nouridio.svg").toString();
        file = file.split("##COLOR##").join(color);
        res.header("content-type", "image/svg+xml").send(file);
    })

    // 404 route
    app.get("*", (req, res) => {
        render(req, res.status(404), "404");
    });
}