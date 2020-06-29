const { updatedDiff: diff } = require("deep-object-diff");
const Case = require("case");
const Embed = require("../classes/Embed");

module.exports = (client, oldMember, newMember) => {
  let d = diff(oldMember, newMember)
  let e = new Embed(client)
    .setTitle("Member updated")
    .setAuthor(newMember.displayName, newMember.user.displayAvatarURL())
    .setThumbnail(newMember.user.displayAvatarURL())
  if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
    e.addInline("Old roles", oldMember["_roles"].sort((a, b) => oldMember.guild.roles.cache.get(a).name.localeCompare(oldMember.guild.roles.cache.get(b).name)).map(role => `<@&${role}>`).join(", ") || "None")
    e.addInline("New roles", newMember["_roles"].sort((a, b) => newMember.guild.roles.cache.get(a).name.localeCompare(newMember.guild.roles.cache.get(b).name)).map(role => `<@&${role}>`).join(", ") || "None")
  }
  Object.keys(d).forEach(k => {
    let r = k
    if (["lastMessageID", "joinedTimestamp", "lastMessageChannelID"].some(t => r == t)) return;
    if (r == "nickname") r = "displayName";
    {
      e.addInline("Old " + Case.lower(k), oldMember[r] || "None")
      e.addInline("New " + Case.lower(k), newMember[r] || "None")
    }
  })
  let l = oldMember.guild.channels.cache
    .get(client.settings.get(oldMember.guild.id, "logchan"))
  if (l) l.send(e)
}