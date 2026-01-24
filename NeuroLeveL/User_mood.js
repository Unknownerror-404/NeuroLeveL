const { GatewayIntentBits } = require("discord.js");
const Moods = require(
  "./your_cmd_file_path/nlp_processing.js"
);

module.exports = {
  name: 'user_mood',
  description: "Get the current mood score of a random user based on their messages.",
  requiredPermission: 'SendMessages',
  usage: '!user_mood',

  async execute(message) {
    if (message.author.bot) return;
    if (!message.guild) return;

    const members = [...message.guild.members.cache.values()];
    if (!members.length) {
      return message.channel.send("No members found.");
    }

    const randomMember = members[Math.floor(Math.random() * members.length)];
    const mood = await Moods.GMOOD(randomMember.id);

    if (mood) {
      return message.channel.send(
        `${randomMember.user.username}'s current mood is: ${mood}`
      );
    } else {
      return message.channel.send(
        `Couldn't determine ${randomMember.user.username}'s mood at the moment.`
      );
    }
  }
};
