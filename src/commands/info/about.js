const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { infoColors } = require("../../constants");

module.exports = {
	options: [(
		new SlashCommandBuilder()
			.setName("about")
			.setDescription("Shows information about the bot.")
	)],
		
  callback(interaction) {
    const embed = new EmbedBuilder()
			.setTitle("About")
			.setDescription([
				"**Version**: 0.1.0",
				"**Working on**: The Grand Update",
				"**State**: Alpha"
			].join("\n"))
			.setColor(infoColors[Math.floor(Math.random() * infoColors.length)]);

    interaction.reply({ embeds: [embed] });
  }
}
