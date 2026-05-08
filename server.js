import express from "express";
import admin from "firebase-admin";
import TelegramBot from "node-telegram-bot-api";
import fs from "fs";

const app = express();

const BOT_TOKEN = "8632790553:AAGnW8iIXP_i3dlYys7kO8e3S2qUwfRAAj8";
const CHAT_ID = "7016214134";

const bot = new TelegramBot(BOT_TOKEN, {
  polling: true,
});

// Firebase Key Load
const serviceAccount = JSON.parse(
  fs.readFileSync("./firebase-key.json", "utf8")
);

// Firebase Initialize
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

db.settings({
  ignoreUndefinedProperties: true,
});

// Last processed message
let lastMessageId = null;

// Check messages every 5 seconds
async function checkMessages() {
  try {
    const snapshot = await db
      .collection("messages")
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();

    snapshot.forEach((doc) => {
      const data = doc.data();

      // Prevent duplicate send
      if (doc.id !== lastMessageId) {
        lastMessageId = doc.id;

        if (data.sender === "visitor") {
          bot.sendMessage(
            CHAT_ID,
            `💬 New Message:\n\n${data.text}`
          );
        }
      }
    });
  } catch (error) {
    console.error("Firestore Error:", error);
  }
}

// Run every 5 seconds
setInterval(checkMessages, 5000);

// Home Route
app.get("/", (req, res) => {
  res.send("Bot Running");
});

// Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server Running");
});
