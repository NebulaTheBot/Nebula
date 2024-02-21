import { EmbedBuilder, type DMChannel, type Client, type Guild } from "discord.js";
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
      const hearts = ["💖", "💝", "💓", "💗", "💘", "💟", "💕", "💞"];
      const dmChannel = (await (await guild.fetchOwner())
        .createDM()
        .catch(() => null)) as DMChannel | null;
      const embed = new EmbedBuilder()
        .setTitle("👋 • Welcome to Nebula!")
        .setDescription(
          [
            "Nebula is a multiplatform, multipurpose bot with the ability to add extensions to have additional features.",
            "To manage the bot, use the **/server settings** command.",
            "Nebula is in an early stage of development. If you find bugs, please go to our [official server](https://discord.gg/c6C25P4BuY) and report them."
          ].join("\n\n")
        )
        .setFooter({ text: `Made by the Nebula team with ${randomise(hearts)}` })
        .setColor(genColor(200));

      await new Commands(guild.client).registerCommandsForGuild(guild);
      if (dmChannel) await dmChannel.send({ embeds: [embed] });
    }
  }
};
