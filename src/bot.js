const { Client, ActivityType, Collection } = require("discord.js");
const Events = require("./handlers/events");
const Commands = require("./handlers/commands");
const chalk = require("chalk");
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

client.subcommands = new Collection();
client.on("ready", () => {
  const commands = new Commands(client);
  new Events(client, commands);
  
  console.log(chalk.green("Start completed. Bot has been alive'd."));
});

client.login(process.env.ENTITY_CANARY);
