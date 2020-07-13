module.exports = async (client, { id, list }) => {
    if (client.owners.map(u => u.id).includes(id)) {
        console.log(` [VOTE] Received test vote from ${list}:  ${id}`);
        return;
    }
    let user = await client.users.fetch(id);
    if (!user) return;
    user.money = user.money + 1;
    console.log(` [VOTE] Received vote from ${list}: ${user.tag} [${user.id}]`);
}