const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

module.exports = {
	options: [
		new SlashCommandBuilder()
			.setName("about")
			.setDescription("Shows information about the bot.")
	],
		
  callback: interaction => {
    const embed = new EmbedBuilder()
			.setTitle("Entity Canary")
			.addFields([
				{ name: "Version", value: "0.1.1", inline: true },
				{ name: "Latest update", value: "The Grand Update", inline: true },
				{ name: "State", value: "Alpha" },
				{ name: "Entities involved", value: `
					**Head Developer**: Serge
					**Developers**: CodingFox, ThyTonyStank
					**Helper**: flojo
					**Testers**: astolfo, flojo`
				},
				{ name: "Sponsors", value: "[FyreBlitz Hosting](https://www.fyreblitz.com/)" },
			])
			.setColor("Random")
			.setFooter({ text: "Made by Serge with love." });

    interaction.reply({ embeds: [embed] });
  }
}
