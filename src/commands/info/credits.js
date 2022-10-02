const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

module.exports = {
  options: [(
    new SlashCommandBuilder()
      .setName("credits")
      .setDescription("Shows people who helped this project.")
  )],

  callback(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("Credits")
			.addFields([
				{ name: "Entities involved", value: `
					**Developers**: CodingFox, ThyTonyStank
					**Helper**: flojo
					**Testers**: astolfo, flojo
					`
				},
				{ name: "Special mentions", value: "**Dumbass**: Serge" },
				{ name: "Sponsors", value: "[FyreBlitz Hosting](https://www.fyreblitz.com/)" },
			])
			.setColor("Random")
			.setFooter({ text: "Made by CodingFox with love." });
    
    interaction.reply({ embeds: [embed] });
  }
}
