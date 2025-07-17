require('dotenv').config();
const UserXP = require('./Xpdistribution.js'); // Importing the UserXP model.

const messages = new Map(); 
const xpDatabase = new Map(); //temporary cache.
let globalmsg = {
    count: 0,
    lastReset: Date.now()
};

function getActiveUserCount(client) { //Function to get the total number of online users, consisting of bots as well.
    return client.guilds.cache.reduce((sum, guild) => {
        return sum + guild.members.cache.filter(
            m => m.presence && ['online', 'idle', 'dnd'].includes(m.presence.status)
        ).size;
    }, 0);
}

class XPHandler {
    constructor() {
        this.cooldown = new Set();
        this.basexp = 10; //Setting base value.
        this.scaling = 1.15; //Setting scaling factor.
        this.perceptronWeight = { activity: 0.5, userFactor: 0.5 }; //Setting weights to fractions, change encouraged.
        this.adjustedweights = { activity: 0.5, userFactor: 0.5 };
        setInterval(() => this.cleanup(), 15 * 60 * 1000); // Cleanup every 15 minutes.
        setInterval(() => {
            globalmsg.count = 0;
            globalmsg.lastReset = Date.now();
        }, 15 * 60 * 1000); // Resetting global message count every 15 minutes.
    }

    async getUser(userId, guildId) { 
        const cacheKey = `${guildId}:${userId}`;
        if (xpDatabase.has(cacheKey)) return xpDatabase.get(cacheKey);

        let user = await UserXP.findOne({ userId, guildId });
        if(!user) {
            user = new UserXP({ userId, guildId });
            await user.save();
        }
        xpDatabase.set(cacheKey, user);
        return user;
    } // Getting user info from temporary cache.

    sigmoid(x, k, center) {
    return 1 / (1 + Math.exp(-k * (x - center)));
    }//Activation function

    update_weights(perceptronWeight, msgC, userC){
        const baseActivity = perceptronWeight.activity;
        const baseUserFactor = perceptronWeight.userFactor;

        const msgs = this.sigmoid(msgC, 0.05, 1000);
        const users = this.sigmoid(userC, 0.01, 200);

        perceptronWeight.activity = baseActivity * msgs;
        perceptronWeight.userFactor = baseUserFactor * users;

        return perceptronWeight;
    }//Dynamic weight updation, base values set to 0.5 change if needed.

    calculateXP(msgCount, userMsgRatio) {
        const normalizeActivity = 1 / (msgCount + 1);
        const normalizeUserRatio = userMsgRatio;
        const bias = 1.0;
        this.adjustedweights = this.update_weights(this.perceptronWeight, msgCount, userMsgRatio);
        const gainMultiplier = (
            (normalizeActivity * this.adjustedweights.activity + normalizeUserRatio * this.adjustedweights.userFactor) + bias
        );
        const activation = Math.max(3 , gainMultiplier); //Relu lie and also clamps at bse value 3 for safeguarding against 0 xp for worst cases.
        const xp = this.basexp * activation;
        return Math.max(1, Math.floor(xp));
    } //Calculating XP based on message count and user ratio.

    getLevelFromXp(xp) {
        return Math.floor(Math.pow(xp / 100, 1 / this.scaling));
    } // Extract levels from XP.

    getXPForNextLevel(level) {
        return Math.floor(100 * Math.pow(level + 1, this.scaling));
    } // Xp required for the next level.

    getAllUsers() {
        return Array.from(xpDatabase.entries()).map(([id, data]) => ({
            userID: id,
            xp: data.xp,
            level: data.level,
            lastActivity: data.lastActivity,
        })).sort((a, b) => b.xp - a.xp);
    } // Extracting user info from temporary database.

    handleMessage(message) {
        if (message.author.bot || !message.guild) return;
        const guildID = message.guild.id;
        const userID = message.author.id;
        const now = Date.now();

        if (!messages.has(guildID)) messages.set(guildID, new Map()); // Creating a new Map if one doesn't exist.
        const guildMessages = messages.get(guildID);

        let userData = guildMessages.get(userID);
        if (!userData) {
            userData = { msg: 0, lastActivity: now }; // Loading a user if data doesn't exist.
            guildMessages.set(userID, userData);
        }

        if (now - userData.lastActivity >= 60 * 60 * 1000) {
            userData.msg = 0;
        } // Resetting message count.

        userData.msg += 1;
        userData.lastActivity = now;
        globalmsg.count += 1;
        // Updating counters if user sends a message.

        if (now - globalmsg.lastReset >= 15 * 60 * 1000) {
            globalmsg.count = 0;
            globalmsg.lastReset = now;
        } //If last reset was more than 15 mins ago, resetting global message count.
    }

    cleanup() {
        const now = Date.now();
        for (const [guildID, guildMessages] of messages.entries()) {
            for (const [userID, userData] of guildMessages.entries()) {
                if (now - userData.lastActivity >= 60 * 60 * 1000) {
                    guildMessages.delete(userID);
                }
            }
            if (guildMessages.size === 0) messages.delete(guildID);
        }
    } // Cleanup function.

    async addXp(userID, guildID, msgCount, userMsgRatio) {
        if (this.cooldown.has(`${guildID}:${userID}`)) return null;
        this.cooldown.add(`${guildID}:${userID}`);
        setTimeout(() => this.cooldown.delete(`${guildID}:${userID}`), 1.5 * 1000); // Anti spam cooldown of 1.5 secs.

        const xpGain = this.calculateXP(msgCount, userMsgRatio);
        const user = await this.getUser(userID, guildID); // Fetching user info.
        const prevLevel = user.level || 0;

        user.xp = (user.xp || 0) + xpGain; // Updating user XP.
        user.lastActivity = Date.now(); // Updating last activity time.
        user.level = this.getLevelFromXp(user.xp); // Fetching user levels from xp.

        await user.save();
        xpDatabase.set(`${guildID}:${userID}`, user); // Update cache after saving

        const leveledUp = user.level > prevLevel;
        return { id: userID, xp: user.xp, level: user.level, gained: xpGain, leveledUp }; //Update user levels if applicable.
    }
}
const XP = new XPHandler();
module.exports = {
    XP,
    globalmsg,
    messages,
    getActiveUserCount
}; //Exporting userdata to be accessed by other files.