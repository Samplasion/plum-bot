class Permission {
  constructor(client, level, name, desc) {
    this.client = client
    this.level = level
  }
  
  validate(msg) {
    return true
  }
}

module.exports = Permission