import express from "express";
import admin from "firebase-admin";
import TelegramBot from "node-telegram-bot-api";
import fs from "fs";

const app = express();

const BOT_TOKEN = "8654324292:AAHTgDvaJeLSWw-PXR3my0AmL8lLktnhhbI";
const CHAT_ID = "8654324292";

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

db.collection("messages")
  .orderBy("time")
  .onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const data = change.doc.data();

        if (data.sender === "visitor") {
          bot.sendMessage(
            CHAT_ID,
            `💬 New Message:\n\n${data.text}`
          );
        }
      }
    });
  });

bot.on("message", async (msg) => {
  if (msg.chat.id.toString() !== CHAT_ID) return;

  if (!msg.text) return;

  if (msg.text.startsWith("/")) return;

  await db.collection("messages").add({
    text: msg.text,
    sender: "admin",
    time: Date.now(),
  });
});

app.get("/", (req, res) => {
  res.send("Bot Running");
});

app.listen(3000, () => {
  console.log("Server Running");
});
