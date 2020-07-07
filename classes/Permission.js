class Permission {
    /**
     * 
     * @param {*} client 
     * @param {number} level 
     * @param {string} name 
     * @param {string} desc 
     */
    constructor(client, level, name, desc) {
        this.client = client
        this.level = level
        this.name = name
        this.description = desc
    }

    /**
     * @param {*} member 
     */
    validate(member) {
        return true
    }
}

module.exports = Permission