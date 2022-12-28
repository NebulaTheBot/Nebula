const { EmbedBuilder, SlashCommandSubcommandBuilder } = require("discord.js");
const { getColor, randomise } = require("../../utils/misc");

module.exports = class Changelog {
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("changelog")
      .setDescription("Shows the changelog for the latest update.");
  }

  run(interaction) {
    console.log(randomise(["/ban", "/clear", "/graph", "/help", "/kick", "/rps", "/warn"]))
    const embed = new EmbedBuilder()
      .setTitle("Changelog for v0.1.0-beta")
      .addFields(
        { name: "Added", value: "**Commands**: /changelog, /echo, /serverinfo, /userinfo" },
        { name: "Work in progress", value: "**Commands**: /ban, /clear, /graph, /help, /kick, /rps, /warn" },
        {
          name: "Changed",
          value: [
            "**Commands**: /about",
            "**Version number**: Rounded to 0.1.0 (previously - 0.0000000001)",
            "**Embed color**: Fixed, slightly random."
          ].join("\n")
        },
        { name: "Removed", value: "**Commands**: /cat, /dog, /embed, /idiot, /kill, /meme, /motivate" },
        { name: "Note", value: "Normal commands are now removed and replaced with slash commands." }
      )
      .setColor(getColor(200));

    interaction.editReply({ embeds: [embed] });
  }
}
