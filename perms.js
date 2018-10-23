const Permission = require("./classes/Permission.js")

class PermissionZero extends Permission {
  constructor(client) {
    super(client, 0, "Bot", "Insert useful description for bots...")
  }
  
  validate(msg) {
    
  }
}