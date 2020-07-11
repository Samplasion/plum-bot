/**
 * @param {import("express").Application} app 
 */
module.exports = function (app) {
    app.get("/", (req, res) => {
        res.render("pages/index")
    })
    app.get("/commands", (req, res) => {
        res.render("pages/commands")
    })
    app.get("/commands/:command", (req, res) => {
        res.render("pages/command", { cmd: req.params.command });
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