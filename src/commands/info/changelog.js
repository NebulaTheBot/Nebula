const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { infoColors } = require("../../constants");

module.exports = {
  options: [(
    new SlashCommandBuilder()
      .setName("changelog")
      .setDescription("Shows the changelog for the latest update.")
  )],

  callback(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("Changelog for v0.1.0")
      .setDescription([
        "**Added**: /changelog, /credits, /echo (replacement for /embed), /serverinfo",
        "**Work in progress**: /graph, /userinfo, /rps, /clear, /kick, /warn, /ban, /cat, /dog, /meme",
        "**Changed**: /about",
        "**Deciding the fate**: /help",
        "**Removed**: /kill, /idiot, /motivate, /embed",
        "**Dem ideas**: make commands have a slightly random but fixed color of embed",
        "\n**Note**:",
        "This update marks the removal of normal commands. The version number got rounded to 0.1.0."
      ].join("\n"))
      .setColor(infoColors[Math.floor(Math.random() * infoColors.length)]);

    interaction.reply({ embeds: [embed] });
  }
}
