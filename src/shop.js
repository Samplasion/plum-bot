module.exports = [
    {
        name: "1-week Premium",
        cost: 150,
        async validate(client, msg) {
            let guild = client.guilds.resolve("689149132371263604");
            let member = guild.members.resolve(msg.author);
            return guild && member && !member.roles.cache.has("730500262204014644")
                ? true
                : "you already have Premium!";
        },
        async onBuy(client, msg) {
            let guild = client.guilds.resolve("689149132371263604");
            guild.members.resolve(msg.author).roles.add("730500262204014644");

            let user = await client.users.fetch("280399026749440000");

            let remObj = {
                text: `Remove the Premium role from ${msg.author.tag} [${msg.author.id}]`,
                date: Date.now() + 7 * 24 * 60 * 60 * 1000,
                userID: 280399026749440000,
                id: (((user.reminders.list || [])[(user.reminders.list || [""]).length-1] || {id:0}).id || 0) + 1
            };

            user.reminders.add(remObj);

            this.client.reminders.raw[user.id] = (this.client.reminders.raw[user.id] || []);
            this.client.reminders.raw[user.id][remObj.id] = setTimeout(() => {
                this.client.utils.remindUser(user, remObj);
                user.reminders.flush();
            }, 7 * 24 * 60 * 60 * 1000);
        }
    }
]