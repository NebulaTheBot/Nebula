const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { getColor } = require("../../utils/getColors");

module.exports = {
	data: [(
		new SlashCommandBuilder()
			.setName("about")
			.setDescription("Shows information about the bot.")
	)],
		
  callback(interaction) {
    const embed = new EmbedBuilder()
			.setTitle("About")
			.setDescription([
				"**Version**: 0.1",
				"**Working on**: The Grand Update",
				"**State**: Alpha"
			].join("\n"))
			.setColor(getColor(200));

    interaction.reply({ embeds: [embed] });
  }
}
