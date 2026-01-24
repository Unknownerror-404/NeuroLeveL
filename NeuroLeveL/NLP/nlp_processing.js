import Sentiment from "sentiment";
import natural from "natural";

//"const { Client, GatewayIntentBits, Collection } = require('discord.js');"
const { ChatInstances } = require("./Chat_selection.js");
const Chat_storage_with_all_info = {};
const User_Id_with_messages = {};

const sentiment = new Sentiment();
const tokenizer = new natural.WordTokenizer();

function extractNLPFeatures(message) {
  const tokens = tokenizer.tokenize(message);
  const sentimentResult = sentiment.analyze(message);

  const features = {
    messageLength: tokens.length,
    questionScore: message.includes("?") ? 1 : 0,
    exclamationScore: message.includes("!") ? 1 : 0,
    capitalizationRatio:
      (message.match(/[A-Z]/g)?.length || 0) / message.length,
    uniqueWordRatio: new Set(tokens).size / tokens.length || 0,
  };
  return features;
}

//async function count(msg){
//if (msg.author.bot || !msg.guild) return false;
//else if(msg.length === 0) return false;
//else if (msg.length > 0) return true;
//}

async function preliminary_data(){
const Chat_temp = await Chat_seg();
const temp_uid = await preprocessing(Chat_temp);
const processed_data = await processing(Chat_temp, temp_uid);
}

async function Chat_seg(){
for (const [UserIds, Chatdata] of ChatInstances.entries()){
Chat_storage_with_all_info[UserIds] = Chatdata;
}
return Chat_storage_with_all_info;
}

// get_uid -> preprocessing -> processing.
async function preprocessing(Chat_storage_with_all_info){
const allUserIds = Object.keys(Chat_storage_with_all_info);
return allUserIds;
}

//Uses all the chat messages to provide a sentimental score for each user.
async function processing(Chat_storage, Uid){
  const userScores = {};

  for (const Id of Uid){
    const Chat = Chat_storage[Id].allMsg;
    if (Chat.length === 0) continue;

    let total = 0;
    for (const Msg of Chat){
      total += await current_mood_score(Msg);
    }

    userScores[Id] = total / Chat.length; // average here
  }

  return userScores;
}

//preliminary_data();

//Provides the sentimental score of the given sentence/message.
async function get_mood(message = ''){
    if (typeof message !== "string" || !message.trim()) return 0; 
    else {
    const sentimentResult = sentiment.analyze(message);
    let sentimentComparative = sentimentResult.comparative;
    return sentimentComparative;
    }
}

//Return the current mood based on messages and divdes it by the total number of messages through ChatInstances.
async function current_mood_score(msg) {
  return await get_mood(msg);
}

async function distribute(Chat_storage_with_all_info){
  const Mood_box={};
  const allUserIds = await preprocessing(Chat_storage_with_all_info)
  const UserScore = await processing(Chat_storage_with_all_info, allUserIds);
  for (const Id of allUserIds){
  if (UserScore[Id] >= 0.3){
    Mood_box[Id] = "Very Positive";
  }
  else if (UserScore[Id] >= 0.05){
    Mood_box[Id] = "Positive";
  }
  else if (UserScore[Id] >= -0.05){
    Mood_box[Id] = "Neutral";
  }
  else if (UserScore[Id] > -0.3){
    Mood_box[Id] = "Negative";
  }
  else {
    Mood_box[Id] = "Very Negative";
  }
  }
  return Mood_box;
}

async function GMOOD(Id){
  const chat_seg = await Chat_seg();
  const mood_data = await distribute(chat_seg);
  return mood_data[Id] ?? null;
}

module.exports = {
    GMOOD
};
