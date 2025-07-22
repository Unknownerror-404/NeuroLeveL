require('dotenv').config();
const { XP } = require('./xphandler.js');
module.exports = {
    name: 'set_ports',
    description: "Set the ports for weights and biases of the xp values",
    requiredPermission: 'MANAGE_GUILD',
    async execute(message, args) {
        const guild = message.guild;
        if (!guild) {
            return message.reply("This command can only be used in a server.");
        }
        if (message.author.bot) return;
        if (args[0] === 'set_port_help') {
            return message.reply("Usage: !set_ports basexp scaling activity userFactor\nExample: !set_ports 10 1.15 0.7 0.3");
        }

        let basexp, scaling, activity, userFactor;
        if (args.length === 4) {
            basexp = Number(args[0]);
            scaling = Number(args[1]);
            activity = Number(args[2]);
            userFactor = Number(args[3]);
            if ([basexp, scaling, activity, userFactor].some(isNaN)) {
                return message.reply("All port values must be numbers.");
            }
            XP.basexp = basexp;
            XP.scaling = scaling;
            XP.perceptronWeight.activity = activity;
            XP.perceptronWeight.userFactor = userFactor;
            return message.reply(`Set XP weights: basexp=${basexp}, scaling=${scaling}, activity=${activity}, userFactor=${userFactor}`);
        } 
        else if (args.length === 3) {
            basexp = Number(args[0]);
            scaling = Number(args[1]);
            activity = Number(args[2]);
            if ([basexp, scaling, activity].some(isNaN)) {
                return message.reply("All port values must be numbers.");
            }
            XP.basexp = basexp;
            XP.scaling = scaling;
            XP.perceptronWeight.activity = activity;
            return message.reply(`Set XP weights: basexp=${basexp}, scaling=${scaling}, activity=${activity}`);
        } 
        else if (args.length === 2) {
            basexp = Number(args[0]);
            scaling = Number(args[1]);
            if ([basexp, scaling].some(isNaN)) {
                return message.reply("All port values must be numbers.");
            }
            XP.basexp = basexp;
            XP.scaling = scaling;
            return message.reply(`Set XP weights: basexp=${basexp}, scaling=${scaling}`);
        } 
        else if (args.length === 1) {
            basexp = Number(args[0]);
            if (isNaN(basexp)) {
                return message.reply("All port values must be numbers.");
            }
            XP.basexp = basexp;
            return message.reply(`Set XP weights: basexp=${basexp}`);
        } 
        else {
            return message.reply("Usage: !set_ports basexp scaling activity userFactor\nExample: !set_ports 10 1.15 0.7 0.3");
        }
    }
};