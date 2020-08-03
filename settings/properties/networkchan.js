const { oneLine } = require("common-tags");

module.exports = {
    name: "Channel to connect to the Plum Network",
    type: "channel",
    extendable: false,
    description: oneLine`This channel will be connected to the Plum Channel
        Network (it requires the "Manage Webhooks" permission). The server and channel
        names will be disclosed.`,
    category: "Plum Network",
    filter(channel) {
        return channel.webhookPerm;
    }
} 