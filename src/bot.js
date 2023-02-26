const { Client, ActivityType } = require("discord.js");
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
    "GuildEmojisAndStickers",
    "GuildPresences"
  ]
});

client.on("ready", async () => {
  new Events(client, new Commands(client));
  console.log(chalk.green("ちーっす！"));
});

client.login(process.env.TOKEN);
