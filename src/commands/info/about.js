const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { getColor } = require("../../utils/misc");

module.exports = class About {
	constructor() {
		this.data = new SlashCommandBuilder()
			.setName("about")
			.setDescription("Shows information about the bot.");
	}

  run(interaction) {
    const embed = new EmbedBuilder()
			.setTitle("About")
			.setDescription([
				"**Version**: 0.1.0-beta",
				"**Working on**: The Grand Update"
			].join("\n"))
			.setColor(getColor(200));

    interaction.editReply({ embeds: [embed] });
  }
}
