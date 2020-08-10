const Permission = require("./classes/Permission.js")

class PermissionMinusOne extends Permission {
    constructor(client) {
        super(client, -1, "common:PERMS.-1.NAME", "common:PERMS.-1.DESC", 2)
    }

    validate(member) {
        return member.user.clientFlags.has("blacklist")
    }
}
class PermissionZero extends Permission {
    constructor(client) {
        super(client, 0, "common:PERMS.0.NAME", "common:PERMS.0.DESC", 2)
    }

    validate(member) {
        return member.user.bot
    }
}

class PermissionOne extends Permission {
    constructor(client) {
        super(client, 1, "common:PERMS.1.NAME", "common:PERMS.1.DESC")
    }

    // eslint-disable-next-line no-unused-vars
    validate(_member) {
        return true;
    }
}

class PermissionTwo extends Permission {
    constructor(client) {
        super(client, 2, "common:PERMS.2.NAME", "common:PERMS.2.DESC")
    }

    validate(member) {
        let mRole = member.guild.config.data.mods;
        return member.roles.cache.has(mRole);
    }
}

class PermissionThree extends Permission {
    constructor(client) {
        super(client, 3, "common:PERMS.3.NAME", "common:PERMS.3.DESC")
    }

    validate(member) {
        let mRole = member.guild.config.data.admins;
        return member.roles.cache.has(mRole);
    }
}

class PermissionFour extends Permission {
    constructor(client) {
        super(client, 4, "common:PERMS.4.NAME", "common:PERMS.4.DESC")
    }

    validate(member) {
        let mRole = member.guild.config.owners;
        return member.roles.cache.has(mRole) || member.guild.ownerID == member.user.id;
    }
}

class PermissionNine extends Permission {
    constructor(client) {
        super(client, 9, "common:PERMS.9.NAME", "common:PERMS.9.DESC", 2)
    }

    validate(member) {
        return member.user.clientFlags.has("bot-helper");
    }
}

class PermissionTen extends Permission {
    constructor(client) {
        super(client, 10, "common:PERMS.10.NAME", "common:PERMS.10.DESC", 2)
    }

    validate(member) {
        return this.client.isOwner(member.user)
    }
}

/** @type {Permission[]} */
const list = [PermissionMinusOne, PermissionZero, PermissionOne, PermissionTwo, PermissionThree, PermissionFour, PermissionNine, PermissionTen];

module.exports = list;