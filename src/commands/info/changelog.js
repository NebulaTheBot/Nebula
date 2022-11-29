const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { getColor } = require("../../utils/misc");

module.exports = class Changelog {
  constructor() {
    this.data = new SlashCommandBuilder()
      .setName("changelog")
      .setDescription("Shows the changelog for the latest update.");
  }

  run(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("Changelog for v0.1.0-beta")
      .addFields(
        { name: "Added", value: "**Commands**: /changelog, /echo, /info" },
        { name: "Work in progress", value: "**Commands**: /ban, /cat, /clear, /dog, /graph, /help, /kick, /rps, /meme, /warn" },
        {
          name: "Changed",
          value: [
            "**Commands**: /about",
            "**Version number**: Rounded to 0.1.0 (previously - 0.0000000001)",
            "**Embed color**: Fixed, slightly random."
          ].join("\n")
        },
        { name: "Removed", value: "**Commands**: /embed, /idiot, /kill, /motivate" },
        { name: "Note", value: "Normal commands are now removed." }
      )
      .setColor(getColor(200));

    interaction.editReply({ embeds: [embed] });
  }
}
