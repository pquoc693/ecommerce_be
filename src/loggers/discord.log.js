"use strict";

const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on("ready", () => {
  console.log("Logged is as ", client.user.tag);
});

// const token = process.env.TOKEN_DISCORD;
const token =
  "MTI1NTY5MTYwMTMyMjQ0Njg5MQ.G3jKKH.hifSPcqj1t_iwUN76u2AtUa7lyCoUhl3qQn8U4";
client.login(token);

// --------------test--------------
client.on("messageCreate", (msg) => {
  if (msg.author.bot) return; // bot trả về thì chặn
  if (msg.content === "hello") {
    msg.reply("Hello! How can I help you?");
  }
});
