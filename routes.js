/**
 * @param {import("express").Application} app 
 * @param {import("./classes/Client")} client
 */
module.exports = function (app, client) {
    app.get("/", (req, res) => {
        res.render("pages/index")
    })
    app.get("/commands", (req, res) => {
        res.render("pages/commands")
    })
    app.get("/commands/:command", (req, res) => {
        let cmds = client.registry.findCommands(req.params.command, false, undefined);
        if (!cmds.length) return res.status(404).render("pages/404");
        res.render("pages/command", { cmd: cmds[0] });
    })
    app.get("/support", (req, res) => {
        res.render("pages/donate")
    })
    app.get("/about", (req, res) => {
        res.render("pages/about")
    })
    app.get("/server", (req, res) => {
        res.redirect(client.options.invite);
    })

    // Webhooks
    app.use("/wh/gbl", (req, res) => {
        if (req.body.auth !== process.env.API_PW) {
            res.status(401);
            delete req.body.auth;
            // this.emit('error', `Unauthorized. You did not specify a correct token.`);
            return res.json({ invalidauth: true });
        }
        delete req.body.auth;
        client.emit('gbl-vote', req.body);
        res.status(200);
        return res.json({ good: true });
    })

    // 404 route
    app.get("*", (req, res) => {
        res.status(404).render("pages/404")
    })
}