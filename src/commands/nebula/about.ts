import { SlashCommandSubcommandBuilder, EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { genColor } from "../../utils/colorGen.js";
import { randomise } from "../../utils/randomise.js";

export default class About {
  data: SlashCommandSubcommandBuilder;
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("about")
      .setDescription("Shows information about the bot.");
  }

  async run(interaction: ChatInputCommandInteraction) {
    const client = interaction.client;
    const members = client.users.cache.filter(user => !user.bot).size;
    const guilds = client.guilds.cache.size;
    const hearts = ["💖", "💝", "💓", "💗", "💘", "💟", "💕", "💞"];

    const embed = new EmbedBuilder()
      .setAuthor({ name: `•  About`, iconURL: client.user.displayAvatarURL() })
      .setDescription("Nebula is a multiplatform, multipurpose bot with the ability to add extensions to have additional features.")
      .setFields(
        {
          name: "📃 • General",
          value: [
            "**Version** 0.1-alpha.1",
            `**${members}** members • **${guilds}** guild • **${client.shard.count}** shard`
          ].join("\n")
        },
        {
          name: "🌌 • Entities involved",
          value: [
            "**Head developer**: Goos",
            "**Developers**: Golem64, ThatBOI",
            "**Designers**: ArtyH, Optix, proJM, Slider_on_the_black",
            "**Translators**: Candel, Dimkauzh, Golem64, Optix, Sungi, SaFire, ThatBOI",
            "**And YOU, for using Nebula.**"
          ].join("\n")
        }
      )
      .setFooter({ text: `Made by the Nebula team with ${randomise(hearts)}` })
      .setThumbnail(client.user.displayAvatarURL())
      .setColor(genColor(270));

    await interaction.followUp({ embeds: [embed] });
  }
}
