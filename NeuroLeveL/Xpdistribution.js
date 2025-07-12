//Before setting up this code, make sure you have a mongoose database in which you can store your user information.
const mongoose = require('mongoose');

const userXpSchema = new mongoose.Schema({ //Setting up the schema for user XP.
    userId: {type: String, required: true, unique: true},
    guildId: {type: String, required: true},
    xp: {type: Number, default: 0},
    level: {type: Number, default: 0},
    lastActivity: {type: Date, default: Date.now}
});

module.exports = mongoose.model('UserXP', userXpSchema); //UserXP is the model that will be used to interact with the user XP data in the database.