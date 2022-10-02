const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

module.exports = {
	options: [(
		new SlashCommandBuilder()
			.setName("about")
			.setDescription("Shows information about the bot.")
	)],
		
  callback(interaction) {
    const embed = new EmbedBuilder()
			.setTitle("About")
			.addFields([
				{ name: "Version", value: "0.1.2", inline: true },
				{ name: "Working on", value: "The Grand Update", inline: true },
				{ name: "State", value: "Alpha", inline: true },
			])
			.setColor("Random")

    interaction.reply({ embeds: [embed] });
  }
}
