import express from "express";
import admin from "firebase-admin";
import TelegramBot from "node-telegram-bot-api";
import fs from "fs";

const app = express();

const BOT_TOKEN = "8654324292:AAHTgDvaJeLSWw-PXR3my0AmL8lLktnhhbI";
const CHAT_ID = "1825049962";

const bot = new TelegramBot(BOT_TOKEN, {
  polling: {
    autoStart: true,
    params: {
      timeout: 10,
    },
  },
});

const serviceAccount = JSON.parse(
  fs.readFileSync("./firebase-key.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

let lastMessageId = null;

// Check Firestore Every 5 Seconds
setInterval(async () => {

  try {

    const snapshot = await db
      .collection("messages")
      .orderBy("time", "desc")
      .limit(1)
      .get();

    snapshot.forEach((doc) => {

      if (doc.id !== lastMessageId) {

        lastMessageId = doc.id;

        const data = doc.data();

        if (data.sender === "visitor") {

          bot.sendMessage(
            CHAT_ID,
            `💬 New Message:\n\n${data.text}`
          );

          console.log("Message Sent");

        }

      }

    });

  } catch (err) {

    console.log(err);

  }

}, 5000);

// Telegram Reply → Firebase
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
