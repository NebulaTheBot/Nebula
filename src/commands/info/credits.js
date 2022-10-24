const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { infoColors } = require("../../constants");

module.exports = {
  options: [(
    new SlashCommandBuilder()
      .setName("credits")
      .setDescription("Shows people who helped this project.")
  )],

  callback(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("Entities involved")
			.setDescription([
        "**Head developer**: Serge",
        "**Bot developers**: itsakuro, CodingFox, ThyTonyStank",
        "**Web developers**: Pigpot, ThyTonyStank",
        "**Helper**: flojo",
        "**Testers**: astolfo, flojo",
        "**Developers who worked in the past**: TechStudent10",
        "\n**Sponsors**: [FyreBlitz Hosting](https://www.fyreblitz.com/)"
      ].join("\n"))
			.setFooter({ text: "Made by the Entity team with 💖" })
			.setColor(infoColors[Math.floor(Math.random() * infoColors.length)]);
    
    interaction.reply({ embeds: [embed] });
  }
}
