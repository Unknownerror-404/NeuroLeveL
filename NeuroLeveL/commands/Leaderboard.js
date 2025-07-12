const UserXP = require('./Xpdistribution.js');
module.exports = {
    name: 'leaderboard',
    description: 'Shows the highest users according to xp values.',
    async execute(message, args) {
        if (message.author.bot) return; //Disregarding bot messages.
        try {
            // Fetch top 10 users directly from MongoDB for this guild
            const topUsers = await UserXP.find({ guildId: message.guild.id }) //Fecthing guild id.
                .sort({ xp: -1 }) //Sorting the usres in descending order of xp.
                .limit(10) //Showing 10 users.
                .lean(); //Using lean() for better performance.

            let leaderboard = "XP Leaderboard\n\n";

            for (let i = 0; i < topUsers.length; i++) {
                const user = topUsers[i];
                if (!user) continue; //Ensuring user exists.
                if (!user.userId) continue; //Ensuring UserId exists.
                let displayName = user.userId;
                const member = await message.guild.members.fetch(user.userId).catch(() => null);
                if (member) {
                    displayName = member.user.tag;
                }
                leaderboard += `\`${i + 1}.\` **${displayName}** - ${user.xp || 0} XP (Lvl ${user.level || 0})\n`; //Formatting the leaderboard with user tag, xp and level.
            }

            return message.channel.send(leaderboard);
        } 
        catch (error) {
            console.error(error);
            return message.reply("An error occurred while generating the leaderboard.");
        }
    }
};