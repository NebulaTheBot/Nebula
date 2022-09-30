const { Client, ActivityType } = require("discord.js");
const Events = require("./handlers/events");
const Commands = require("./handlers/commands");
require("dotenv").config();

const client = new Client({
  presence: {
    activities: [{ name: 'everyone!', type: ActivityType.Listening }]
  },
  intents: [
    "Guilds",
    "GuildMembers",
    "GuildMessages",
    "GuildEmojisAndStickers"
  ]
});

client.on("ready", () => {
  const commands = new Commands(client);
  new Events(client, commands);
  
  console.log("Start completed. Bot has been alive'd.");
});

client.login(process.env.ENTITY_CANARY);
