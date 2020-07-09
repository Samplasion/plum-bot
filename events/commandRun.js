/**
 * @param {number} num 
 * @param {number} scale 
 */
function roundNumber(num, scale) {
    if (!("" + num).includes("e")) {
        return +(Math.round(+(num + "e+" + scale)) + "e-" + scale);
    } else {
        var arr = ("" + num).split("e");
        var sig = ""
        if (+arr[1] + scale > 0) {
            sig = "+";
        }
        return +(Math.round(+(+arr[0] + "e" + sig + (+arr[1] + scale))) + "e-" + scale);
    }
}

/**
 * @type {Map<string, number>}
 */
let commandsRan = new Map();

module.exports = async (client, command, promise /* <Message> */ , message /* <prefix><command> <args> */ , args, isCommandPattern) => {
    var cmdArgs = []
    if (args instanceof Array) cmdArgs = args
    else if (args instanceof String) cmdArgs = [args]
    else cmdArgs = Object.values(args)
    var botMsg = await promise || null
    var guild = message.guild
    if (!message.guild) guild = {
        name: "Direct Messages",
        id: client.user.id
    };

    let e = client.utils.emojis;
    let embed = client.utils.log(
        e.info + " Command run",
        message.cleanContent,
        [
            [`${e.user} Author`, `${message.author.tag} [${message.author.id}]`],
            [`${e.server} Server`, `${message.guild.name} [${message.guild.id}]`],
            [`${e.channel} Channel`, `#${message.channel.name} [${message.channel.id}] (<#${message.channel.id}>)`],
            [`${e.numbers} Message ID`, `${message.id}`, true]
        ],
        false, message.guild.iconURL()
    );
    console.log(`  [CMD] ${message.command.name}(${cmdArgs.join(", ")}) [${botMsg ? roundNumber((botMsg.createdAt - message.createdAt), 2) : "No "}ms] ${message.author.username}[${message.author.id}] ${message.channel.name}[${message.channel.id}] ${guild.name}[${guild.id}]`);
    guild.updateInfo();

    // Show the "Donate" embed
    if (!commandsRan.has(message.author.id)) {
        commandsRan.set(message.author.id, 0);
    }
    // @ts-expect-error
    if (commandsRan.get(message.author.id) > 40) {
        message.channel.send(client.utils.fastEmbed(
            "You seem to love Plum Bot",
            "But unfortunately, hosting isn't free. " +
            "You can give me a hand by [donating](https://www.patreon.com/samplasion). " +
            "You'll also get some awesome perks! You can know more about it using " +
            "the `premium` command."
        ));
        commandsRan.set(message.author.id, 0);
    } else {
        //@ts-expect-error
        commandsRan.set(message.author.id, commandsRan.get(message.author.id) + 1);
    }
}