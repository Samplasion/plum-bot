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
    app.get("/commandstest", (req, res) => {
        res.render("pages/commandstest")
    })
    app.get("/about", (req, res) => {
        res.render("pages/about")
    })
    app.get("/feedback", (req, res) => {
        res.render("pages/feedback")
    })
    // 404 route
    app.get("*", (req, res) => {
        res.status(404).render("pages/404")
    })
}