class Logger {
    static log(...data) {
        Logger._log("Blue", "  [LOG]", ...data);
    }
    static error(...data) {
        Logger._log("Red", "  [ERR]", ...data)
    }
    static debug(...data) {
        Logger._log("Yellow", "[DEBUG]", ...data)
    }
    static site(...data) {
        Logger._log("Magenta", " [SITE]", ...data)
    }
    static load(...data) {
        Logger._log("Green", " [LOAD]", ...data);
    }
    static event(...data) {
        Logger._log("Cyan", "  [EVT]", ...data)
    }
    static warn(...data) {
        Logger._log("Yellow", " [WARN]", ...data)
    }

    /** @param {string[]} data */
    static _log(color, type, ...data) {
        data = data.map(str => {
            return `${str}`.split("\n").map(line => {
                return `${Colors["Fg" + color]}${type} ${line}${Colors.Reset}`;
            }).join("\n");
        });

        console.log(data.join("\n"));
    }
}

const Colors = Object.freeze({
    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Dim: "\x1b[2m",
    Underscore: "\x1b[4m",
    Blink: "\x1b[5m",
    Reverse: "\x1b[7m",
    Hidden: "\x1b[8m",
    
    FgBlack: "\x1b[30m",
    FgRed: "\x1b[31m",
    FgGreen: "\x1b[32m",
    FgYellow: "\x1b[33m",
    FgBlue: "\x1b[34m",
    FgMagenta: "\x1b[35m",
    FgCyan: "\x1b[36m",
    FgWhite: "\x1b[37m",
    
    BgBlack: "\x1b[40m",
    BgRed: "\x1b[41m",
    BgGreen: "\x1b[42m",
    BgYellow: "\x1b[43m",
    BgBlue: "\x1b[44m",
    BgMagenta: "\x1b[45m",
    BgCyan: "\x1b[46m",
    BgWhite: "\x1b[47m"
});

module.exports = Logger;
exports.Colors = Colors;