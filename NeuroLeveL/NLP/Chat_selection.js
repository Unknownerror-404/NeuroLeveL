const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { set } = require('mongoose');
require('dotenv').config();
const env = process.env;
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
const ChatInstances = new Map();

function displayCurrentTime() {
   const time = new Date();
    return [time.getHours(), time.getMinutes(), time.getSeconds()];
}

function time_min() {
    const time = new Date();
    time.setMinutes(time.getMinutes() + 15);
    return [time.getHours(), time.getMinutes(), time.getSeconds()];
}

let t_min = time_min();
let curr_min = displayCurrentTime();
let beg_min = curr_min;

function toSeconds([h, m, s]) {
    return h * 3600 + m * 60 + s;
}

function isWithinTimeRange(curr, start, end) {
    const currSec = toSeconds(curr);
    const startSec = toSeconds(start);
    const endSec = toSeconds(end);
    return currSec >= startSec && currSec <= endSec;
}

class ChatMsg {
    constructor(UserId = '') {
        this.UserId = UserId;
        this.allMsg = [];
        this.channels = new Set();
        this.User_with_message = new Map();
    }

    addMessage(username, content, channelId) {
        this.allMsg.push(content);
        this.User_with_message.set(username, content);
        this.channels.add(channelId);
    }
}

async function client_ready(client) {
    return new Promise(resolve => {
        client.once('ready', () => {
            console.log('Client is ready!');
            resolve(true);
        });
    });
}

async function Construct_message(client, flag) {
    if (!flag) return;

    client.on('messageCreate', message => {
        if (message.author.bot || !message.guild) return;

        const userId = message.author.id;
        const username = message.author.username;
        const content = message.content;
        const channelId = message.channel.id;
        let curr_min = displayCurrentTime();
        if (isWithinTimeRange(curr_min, beg_min, t_min)) {
        let chat_instance = ChatInstances.get(userId);
        if (!chat_instance) {
            chat_instance = new ChatMsg(userId);
            ChatInstances.set(userId, chat_instance);
        }
        chat_instance.addMessage(username, content, channelId);
        console.log("Message processed and added to ChatInstances");
    }
    else {
        console.log("Message are being processed in 15 min intervals, here it has been exceeded.");
    }
    });
}

async function cleanup(){
    console.log("Cleaning up ChatInstances...");
    ChatInstances.clear();
}

function updateWindow() {
    beg_min = displayCurrentTime();
    t_min = time_min();
    console.log("Time window updated:", beg_min, t_min);
}

function interval_cleanup(){
    setInterval(() => {
        cleanup();
        updateWindow()
    }
    ,15 * 60 * 1000);}

(async () => {
    await client.login(env.Discord_token);
    await client_ready(client);
    interval_cleanup();
    Construct_message(client, true);
})();

module.exports = { ChatInstances };
