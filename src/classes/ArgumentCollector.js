const { ArgumentCollector, Argument } = require("discord.js-commando");

module.exports = class PlumArgCollector extends ArgumentCollector {
    constructor(client, args) {
        super(client, args, 0);
    }

    async obtain(msg, provided) {
        let values = {};
        let results = [];

        for (let i = 0; i < this.args.length; i++) {
            let arg = this.args[i];
            let res = await arg.obtain(msg, provided[i], 0);
            results.push(res);

            if (res.cancelled) {
                return {
                    values: null,
                    cancelled: res.cancelled,
                    prompts: [],
                    answers: []
                }
            }

            values[arg.key] = res.value;
        }

        return {
            values,
            cancelled: null,
            prompts: [].concat(...results.map(res => res.prompts)),
            answers: [].concat(...results.map(res => res.answers))
        }
    }
}