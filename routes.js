/**
 * @param {import("express").Application} app 
 * @param {import("./classes/Client")} client
 */
module.exports = function (app, client, passport, session) {
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

    // 404 route
    app.get("*", (req, res) => {
        res.status(404).render("pages/404")
    })
}