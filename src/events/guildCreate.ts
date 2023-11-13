import { EmbedBuilder, type Client, type Guild, DMChannel } from "discord.js";
import Commands from "../handlers/commands.js";
import randomise from "../utils/randomise.js";
import { genColor } from "../utils/colorGen.js";

export default {
  name: "guildCreate",
  event: class GuildCreate {
    client: Client;

    constructor(client: Client) {
      this.client = client;
    }

    async run(guild: Guild) {
      const owner = await guild.fetchOwner();
      const dmChannel = (await owner.createDM().catch(() => null)) as DMChannel | null;;
      const hearts = ["💖", "💝", "💓", "💗", "💘", "💟", "💕", "💞"];

      const embed = new EmbedBuilder()
        .setTitle("👋 • Welcome to Nebula!")
        .setDescription([
          "Nebula is a multiplatform, multipurpose bot with the ability to add extensions to have additional features.",
          "To do things like disabling/enabling commands, use the **/settings** command.",
          "As of now, it's in an early stage of development. If you find bugs, please go to our [official server](https://discord.gg/7RdABJhQss) to report them."
        ].join("\n\n"))
        .setFooter({ text: `Made by the Nebula team with ${randomise(hearts)}` })
        .setColor(genColor(200));

      if (dmChannel) await dmChannel.send({ embeds: [embed] });

      const commands = new Commands(guild.client);
      await commands.registerCommandsForGuild(guild);
    }
  }
}
