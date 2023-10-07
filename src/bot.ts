import { Client, ActivityType } from "discord.js";
import { start } from "./webserver/server.js";
import Commands from "./handlers/commands.js";
import Events from "./handlers/events.js";

const client = new Client({
  presence: {
    activities: [{ name: "with /settings!", type: ActivityType.Playing }]
  },
  intents: [
    "Guilds",
    "GuildMembers",
    "GuildMessages",
    "GuildEmojisAndStickers",
    "GuildPresences",
    "MessageContent"
  ]
});

client.on("ready", async () => {
  start(client);
  new Events(client);
  await new Commands(client).registerCommands();
  console.log("ちーっす！");
});

client.login(process.env.ANOTHER_TOKEN);
