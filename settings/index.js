const { readdirSync } = require('fs');
const { join } = require("path");
const dirname = require('es-dirname');
const databaseModule = require('../utils/database.js');

let settingProps = {}
let types = [];

let propertyFileNames = readdirSync(join(dirname(), 'properties'))
for (var propertyFileName of propertyFileNames) {
	settingProps[propertyFileName.split('.').slice(0, -1).join('.')] = require(join(dirname(), 'properties', propertyFileName))
}

let typesFileNames = readdirSync(join(dirname(), 'properties'))
for (var typeFileName of typesFileNames) {
	types.push(require(join(dirname(), 'properties', typeFileName)));
}

let findType = (key) => types.filter(type => type.id == settingProps[key].type)[0];
let getKey = (client, msg, key) => {
	let data = databaseModule.serverconfig.findOne({guildID: msg.guild.id});

	let value = data[key];
	return findType(key).deserialize(client, msg, value);
}

module.exports = {
	types, findType, getKey, settingProps
};