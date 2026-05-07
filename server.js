import express from "express";
import admin from "firebase-admin";
import TelegramBot from "node-telegram-bot-api";

const app = express();

const BOT_TOKEN = "8654324292:AAHTgDvaJeLSWw-PXR3my0AmL8lLktnhhbI";

const CHAT_ID = "1825049962";

const bot = new TelegramBot(BOT_TOKEN,{polling:true});

const serviceAccount = {

"type": "service_account",
"project_id": "blogger-chat-f29f8",
"private_key_id": "14ba5354c7b7500058f233c44b02a9c80dd905f7",
"private_key": "-----BEGIN PRIVATE KEY-----\nREPLACE_WITH_YOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
"client_email": "firebase-adminsdk-fbsvc@blogger-chat-f29f8.iam.gserviceaccount.com",
"client_id": "108787595178256503227"

};

admin.initializeApp({
credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

db.collection("messages")
.orderBy("time")
.onSnapshot((snapshot)=>{

snapshot.docChanges().forEach((change)=>{

if(change.type==="added"){

const data=change.doc.data();

if(data.sender==="visitor"){

bot.sendMessage(
CHAT_ID,
`💬 New Message:\n\n${data.text}`
);

}

}

});

});

bot.on("message",async(msg)=>{

if(msg.chat.id.toString()!==CHAT_ID) return;

if(msg.text.startsWith("/")) return;

await db.collection("messages").add({

text:msg.text,
sender:"admin",
time:Date.now()

});

});

app.get("/",(req,res)=>{

res.send("Bot Running");

});

app.listen(3000,()=>{

console.log("Server Running");

});
