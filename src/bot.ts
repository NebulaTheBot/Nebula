import { Client, ActivityType, Partials } from "discord.js";
import Commands from "./handlers/commands";
import Events from "./handlers/events";

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
    "MessageContent",
    "GuildMessageReactions"
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.on("ready", async () => {
  new Events(client);
  await new Commands(client).registerCommands();
  console.log("ちーっす！");
});

client.login(process.env.TOKEN);
