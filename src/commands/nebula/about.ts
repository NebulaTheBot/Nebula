import { SlashCommandSubcommandBuilder, EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { genColor } from "../../utils/colorGen.js";
import randomise from "../../utils/randomise.js";

export default class About {
  data: SlashCommandSubcommandBuilder;
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("about")
      .setDescription("Shows information about the bot.");
  }

  async run(interaction: ChatInputCommandInteraction) {
    const client = interaction.client;
    const hearts = ["💖", "💝", "💓", "💗", "💘", "💟", "💕", "💞"];

    const aboutEmbed = new EmbedBuilder()
      .setAuthor({ name: `•  About`, iconURL: client.user.displayAvatarURL() })
      .setDescription(
        "Nebula is a multiplatform, multipurpose bot with the ability to add extensions to have additional features."
      )
      .setFields(
        {
          name: "📃 • General",
          value: ["**Version**: v0.1-alpha", `**Guild count**: ${client.guilds.cache.size}`].join("\n"),
          inline: true,
        },
        {
          name: "🌌 • Entities involved",
          value: [
            "**Head developer**: Goos",
            "**Developers**: Golem64, ThatBOI",
            "**Designers**: Optix, ProJM, Slider_on_the_black, Fox",
            "**Translators**: Golem64, ThatBOI, Optix, Sungi, SaFire",
            "**And YOU, for using Nebula.**",
          ].join("\n")
        }
      )
      .setFooter({ text: `Made by the Nebula team with ${randomise(hearts)}` })
      .setThumbnail(client.user.displayAvatarURL())
      .setColor(genColor(270));

    await interaction.followUp({ embeds: [aboutEmbed] });
  }
}
