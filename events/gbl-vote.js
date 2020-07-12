module.exports = async (client, { id, test }) => {
    if (test) {
        console.log(" [VOTE] Received test vote from Glenn Bot List: " + id);
        return;
    }
    let user = await client.users.fetch(id);
    user.money = user.money + 1;
    console.log(` [VOTE] Received vote from Glenn Bot List: ${user.tag} [${user.id}]`);
}