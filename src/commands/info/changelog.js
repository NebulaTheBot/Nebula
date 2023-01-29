const { EmbedBuilder, SlashCommandSubcommandBuilder } = require("discord.js");
const { getColor } = require("../../utils/misc");

module.exports = class Changelog {
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("changelog")
      .setDescription("Shows the changelog for the latest update.");
  }

  run(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("Changelog for v0.1-beta")
      .addFields(
        {
          name: "✅ • Added",
          value: [
            "**Commands**: /echo embed, message; /help; /info about, changelog, donate, server, user; /manabe bam, ban, clear, kick, unban, warn"
          ].join("\n") 
        },
        {
          name: "🗂️ • Changed",
          value: [
            "**Commands**: /info about",
            "**Version number**: Rounded to 0.1 (previously - 0.0000000001)",
            "**Embed color**: Fixed, slightly random."
          ].join("\n")
        },
        {
          name: "🗑️ • Removed",
          value: [
            "**Commands**: /cat, /dog, /embed, /idiot, /kill, /meme, /motivate",
            "**Prefixed commands**"
          ].join("\n")
        }
      )
      .setColor(getColor(200));

    interaction.editReply({ embeds: [embed] });
  }
}
