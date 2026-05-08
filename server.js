import express from "express";
import admin from "firebase-admin";
import TelegramBot from "node-telegram-bot-api";
import fs from "fs";

const app = express();

const BOT_TOKEN = "YOUR_BOT_TOKEN";
const CHAT_ID = "YOUR_CHAT_ID";

const bot = new TelegramBot(BOT_TOKEN, {
polling: true,
});

const serviceAccount = JSON.parse(
fs.readFileSync("./firebase-key.json", "utf8")
);

admin.initializeApp({
credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

db.collection("messages").onSnapshot((snapshot) => {
snapshot.docChanges().forEach((change) => {
if (change.type === "added") {
const data = change.doc.data();

  if (data.sender === "visitor") {
    bot.sendMessage(
      CHAT_ID,
      `💬 New Message:\n\n${data.text}`
    ).catch(console.error);
  }
}

});
});

app.get("/", (req, res) => {
res.send("Bot Running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
console.log("Server Running");
});
