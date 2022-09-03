const { Client, GatewayIntentBits, ActivityType } = require("discord.js");
require("dotenv").config();
const snoowrap = require("snoowrap");
const commands = require("./handlers/commands");

const client = new Client({
  presence: {
    activities: [{ name: 'everyone!', type: ActivityType.Listening }]
  },
	intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.MessageContent
  ]
});

const r = new snoowrap({
  userAgent: process.env.USER_AGENT,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  username: process.env.USERNAME,
  password: process.env.PASSWORD
});

module.exports = { client, r };

client.on("ready", () => {
  commands(client);
  console.log("Start completed. Bot has been alive'd.");
})
client.login(process.env.ENTITY_CANARY);
