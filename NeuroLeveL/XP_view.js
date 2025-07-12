const { XP } = require('./xphandler.js');
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
            const userData = await XP.getUser(user.id, message.guild.id); // Accessing user data.
            const nextLevelXP = XP.getXPForNextLevel(userData.level || 0); // Access xp requried for succeeding levels.
            const xpToNext = nextLevelXP - (userData.xp || 0); // Calculate XP needed for next level.

            return message.reply(
                `${user.username}, you're level ${userData.level || 0} with ${userData.xp || 0} XP.\n` +
                `You need ${xpToNext} more XP to level up and reach ${((userData.level || 0) + 1)}.` //Logging user level and XP.
            );
        } 
        catch (error) {
            console.log(error);
            return message.reply(`Error providing user XP.`); //error logging.
        }
    }
}