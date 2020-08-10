const loki = require("lokijs");

const db = new loki(process.cwd() + '/database.db', {
	autoload: true,
	autosave: true,
	autosaveInterval: 25000,
	autoloadCallback: loadCollections,
})

const collections = [
    'infractions',
    'serverconfig',
    'globals',
    'reminds',
    'tags',
    'levels',
    'swears',
    'partners',
    'usersettings',
    'giveaways',
    'customAliases'
];
function loadCollections () {
	collections.forEach(x => {
		let coll = db.addCollection(x)

		db[x] = coll
	})
}

module.exports = db
