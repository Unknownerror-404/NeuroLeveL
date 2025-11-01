import Sentiment from "sentiment";
import natural from "natural";
import { globalmsg, messages  } from "../xp_handler/xp";

const gbmsg = globalmsg;
const msg = messages;
const sentiment = new Sentiment();
const tokenizer = new natural.WordTokenizer();

export function extractNLPFeatures(message) {
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

async function count(msg){
if (msg.author.bot || !msg.guild) return false;
else if(msg.length === 0) return false;
else if (msg.length > 0) return true;
}

async function preprocessing(msg){
  let turn = 0;
if (!msg || !msg.content) return [];
let begin = await count(msg);
if (begin === false) return [];
if (gbmsg.count !== 0){

}
else {
  let message_Content = Array.from(msg.values());
  let text = message_Content;
    for (let i = 0; i < message_Content.length; i++){
      if (text.at(-1) !== message_Content[i]){
        continue;
      }
      else if (text.at(-1) === message_Content[i]){
      text.splice(0, text.length -1);
      j=i;
      while (j < message_Content.length - 1){
      text += message_Content[j+1];
      j++;
      }

      }
    }
  let message_uId = Array.from(msg.keys());
  
}
}

async function get_mood(message = ''){
    if (typeof message !== "string" || !message.trim()) return 0; 
    else {
    const sentimentResult = sentiment.analyze(message);
    let sentimentComparative = sentimentResult.comparative;
    return sentimentComparative;
    }
}

async function current_mood_score(msg){
    let messg = await preprocessing(msg); //preprocessing going off means a new message was added, which we need to consider. SO msg is now a single message array handled by preprocessing so we use at(-1)
    if (messg.length === 0) return 0;
    let current_mood_score = 0;
    const recent_Message = messg.at(-1) ;
    current_mood_score += get_mood(recent_Message);
    return current_mood_score / messagesArray.length;
}

function relativeImprovement(gbmsg, msg){
    if (gbmsg.count === 0) return 0; 
    else{
        const messagesArray = Array.from(msg.values());
        const latestMessage = messagesArray.at(-1);
        const previousMessage = messagesArray.at(-2);
    }

}