import {
  EmbedBuilder, type DMChannel, type Client,
  type Guild
} from "discord.js";
import { genColor } from "../utils/colorGen";
import { randomise } from "../utils/randomise";
import Commands from "../handlers/commands";

export default {
  name: "guildCreate",
  event: class GuildCreate {
    client: Client;

    constructor(client: Client) {
      this.client = client;
    }

    async run(guild: Guild) {
      const owner = await guild.fetchOwner();
      const dmChannel = (await owner.createDM().catch(() => null)) as DMChannel | null;
      const hearts = ["💖", "💝", "💓", "💗", "💘", "💟", "💕", "💞"];

      const embed = new EmbedBuilder()
        .setTitle("👋 • Welcome to Nebula!")
        .setDescription([
          "Nebula is a multiplatform, multipurpose bot with the ability to add extensions to have additional features.",
          "To manage the bot, sign into the [dashboard](https://dash.nebulabot.org).",
          "Nebula is in an early stage of development. If you find bugs, please go to our [official server](https://discord.gg/7RdABJhQss) and report them."
        ].join("\n\n"))
        .setFooter({ text: `Made by the Nebula team with ${randomise(hearts)}` })
        .setColor(genColor(200));

      const commands = new Commands(guild.client);
      await commands.registerCommandsForGuild(guild);
      if (dmChannel) await dmChannel.send({ embeds: [embed] });
    }
  }
}
