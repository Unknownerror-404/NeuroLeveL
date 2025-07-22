const { XP } = require('./xp.js');
const Calc = require('./calculation.js');
module.exports = {
    name: 'viewxp',
    description: "Provides the current xp level for users.",
    async execute(message, args) {
        if (message.author.bot) return; //Disregarding bot messages.
        let user = message.author;
        if (message.mentions.users.size > 0) {
            user = message.mentions.users.first();
        } //If a user is mentioned, use that user instead of the message author.
        try {
            const guildID = message.guild.id; // Accessing user data.
            const guildMessages = require('./xp.js').messages.get(guildID) || new Map(); 
            const msgCount = guildMessages.get(user.id)?.msg || 0;
            const totalMessages = Array.from(guildMessages.values()).reduce((sum, u) => sum + u.msg, 0);
            const userMsgRatio = totalMessages ? msgCount / totalMessages : 0;
            const userData = await XP.getUser(user.id, guildID);
            const nextLevelXP = XP.getXPForNextLevel(userData.level || 0, msgCount, userMsgRatio); // Access xp requried for succeeding levels.
            const xpToNext = nextLevelXP - (userData.xp || 0); // Calculate XP needed for next level.

            return message.reply(
                `${user.username}, you're level ${userData.level || 0} with ${userData.xp || 0} XP.\n` +
                `You need ${xpToNext} more XP to level up and reach ${((userData.level || 0) + 1)}.\n` + //Logging user level and XP.
                `Your message count: ${msgCount}\n` +
                `Your message ratio: ${(userMsgRatio * 100).toFixed(2)}%`
            );
        } catch (error) {
            console.log(error);
            return message.reply(`Error providing user XP.`); //error logging.
        }
    }
};