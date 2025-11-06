require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
    ]
});
const mongoose = require('mongoose');
const calc = require('./NeuroLeveL/XP_calc.js');
const { XP } = require('./NeuroLeveL/xphandler.js');
const { connect } = require('http2');
const prefix = '!'; //Default prefix for your commands, change if required.

async function connectTODatabase() {
    try{
        await mongoose.connect(process.env.MONGO_URL); //Attempting connection to the database.
        console.log("Connected to MongoDB.");

        client.commands = new Collection(); //Creating a collection to stroe the user commands.

        function getAllCommandFiles(dir, files = []) {
            fs.readdirSync(dir).forEach(file => {
                const fullPath = path.join(dir, file);
                if (fs.statSync(fullPath).isDirectory()) {
                    getAllCommandFiles(fullPath, files);
                } else if (file.endsWith('.js')) {
                    files.push(fullPath);
                }
            });
            return files;
        } //Get all command files recursively.

        const commandFiles = getAllCommandFiles(path.join(__dirname, 'NeuroLeveL'));
        for (const file of commandFiles) {
            const command = require(file);
            if (!command.name || typeof command.execute !== 'function') continue;
        } //Load all commands into the client.

        client.login(process.env.Discord_token); //Logging into Discord using the bot token from the .env file.
        client.once('ready', () => {
            console.log(`Logged in as ${client.user.tag}!`);
        });
    
        setInterval(() => { calc.applyXp(client); }, 1 * 60 * 1000); // Set up XP awarding in batch every minute.

    client.on('messageCreate', message => {
        if (message.author.bot || !message.content.startsWith(prefix)) return; //Command listener.

        const args = message.content.slice(prefix.length).trim().split(/ +/); //Arguements listener.
        const commandName = args.shift().toLowerCase(); //Extracting the command name from input arguements.
        const command = client.commands.get(commandName); //Searching the command in the collection.
        if (!command) return;

        try {
            command.execute(message, args); //Executing the command.
        } catch (error) {
            console.error(error);
            message.reply('There was an error trying to execute that command!');
        }
    });
}
catch (error) {
        console.error('Error connecting to MongoDB:', error); //Error logging.
    }
};
process.on('unhandledRejection', err => {
    console.error("Unhandled promise:", err);
});
connectTODatabase(); //Calling the function to connect to the database.
process.on('SIGINT', async () => {
    console.log('Shutting down bot...');

    // Closing MongoDB connection.
    await mongoose.connection.close()
        .then(() => console.log('MongoDB connection closed.'))
        .catch(err => console.error('Error closing MongoDB:', err));

    // Destroy the Discord client.
    await client.destroy()
        .then(() => console.log('Discord client destroyed.'))
        .catch(err => console.error('Error destroying client:', err));

    process.exit(0);
});