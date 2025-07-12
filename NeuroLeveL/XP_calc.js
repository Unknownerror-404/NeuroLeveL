const { XP, globalmsg, messages, getActiveUserCount } = require('./xphandler.js'); // Importing the XP handler and global message tracking.
class Calc {
    getRatios(client, guildID, userID) {
        const guildMessages = messages.get(guildID) || new Map(); // Getting guildID or creating another if one doesnt exist.
        const totalMessages = Array.from(guildMessages.values()).reduce((sum, u) => sum + u.msg, 0); // Calculating total messages in the guild.
        const userMessages = guildMessages.get(userID)?.msg || 0; // Accessing user specific messages.
        const userMsgRatio = totalMessages ? userMessages / totalMessages : 0; // Calculating user message ratio.
        const msgCount = userMessages;
        return { userMsgRatio, msgCount };
    }

    async applyXp(client) {
        for (const [guildID, guildMessages] of messages.entries()) {
            for (const [userID, userData] of guildMessages.entries()) {
                const { userMsgRatio, msgCount } = this.getRatios(client, guildID, userID); // Getting user message ratio and count.
                await XP.addXp(userID, guildID, msgCount, userMsgRatio); //Passing values to addXP function.
            }
        }
    }
}
module.exports = new Calc(); //exporting module.