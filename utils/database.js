const loki = require("lokijs");

const db = new loki('database.db', {
	autoload: true,
	autosave: true,
	autosaveInterval: 25000,
	autoloadCallback: loadCollections,
})

const collections = ['infractions', 'serverconfig', 'global', 'reminders'];
function loadCollections () {
	collections.forEach(x => {
		let coll = db.addCollection(x)

		db[x] = coll
	})
}

module.exports = db
