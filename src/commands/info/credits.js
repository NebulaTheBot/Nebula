const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

module.exports = {
  options: [(
    new SlashCommandBuilder()
      .setName("credits")
      .setDescription("Shows people who helped this project.")
  )],

  callback(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("Entities involved")
			.setDescription(`
				**Head Developer**: Serge
				**Bot Developers**: itsakuro, CodingFox, ThyTonyStank
				**Web Developers**: Pigpot, ThyTonyStank
				**Helper**: flojo
				**Testers**: astolfo, flojo
			`)
			.addFields([
				{ name: "Sponsors", value: "[FyreBlitz Hosting](https://www.fyreblitz.com/)" }
			])
			.setFooter({ text: "Made by Serge with love." })
			.setColor("Random");
    
    interaction.reply({ embeds: [embed] });
  }
}
