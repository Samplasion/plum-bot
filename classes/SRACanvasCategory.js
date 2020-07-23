const { Category } = require("some-random-api");

module.exports = class CanvasCategory extends Category {
    constructor() {
        super('/canvas');
    }
    gay(avatar) {
        if (!avatar)
            throw new Error("Parameter \"avatar\" is required.");
        return this.requestBuffer("/gay", { avatar });
    }
    glass(avatar) {
        if (!avatar)
            throw new Error("Parameter \"avatar\" is required.");
        return this.requestBuffer("/glass", { avatar });
    }
    triggered(avatar) {
        if (!avatar)
            throw new Error("Parameter \"avatar\" is required.");
        return this.requestBuffer("/triggered", { avatar });
    }
    wasted(avatar) {
        if (!avatar)
            throw new Error("Parameter \"avatar\" is required.");
        return this.requestBuffer("/wasted", { avatar });
    }
    greyscale(avatar) {
        if (!avatar)
            throw new Error("Parameter \"avatar\" is required.");
        return this.requestBuffer("/greyscale", { avatar });
    }
    invert(avatar) {
        if (!avatar)
            throw new Error("Parameter \"avatar\" is required.");
        return this.requestBuffer("/invert", { avatar });
    }
    brighten(avatar) {
        if (!avatar)
            throw new Error("Parameter \"avatar\" is required.");
        return this.requestBuffer("/brightness", { avatar });
    }
    threshold(avatar) {
        if (!avatar)
            throw new Error("Parameter \"avatar\" is required.");
        return this.requestBuffer("/threshold", { avatar });
    }
    sepia(avatar) {
        if (!avatar)
            throw new Error("Parameter \"avatar\" is required.");
        return this.requestBuffer("/sepia", { avatar });
    }
    color(hex) {
        if (!hex)
            throw new Error("Parameter \"hex\" is required.");
        return this.requestBuffer("/colorviewer", { hex });
    }
    youtubeComment(avatar, username, comment) {
        if (!avatar)
            throw new Error("Parameter \"avatar\" is required.");
        if (!username)
            throw new Error("Parameter \"username\" is required.");
        if (!comment)
            throw new Error("Parameter \"comment\" is required.");
        return this.requestBuffer('/youtube-comment', { avatar, username, comment });
    }
}