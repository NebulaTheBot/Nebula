const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { getColor } = require("../../utils/getColors");

module.exports = {
  data: [(
    new SlashCommandBuilder()
      .setName("credits")
      .setDescription("Shows people who helped this project.")
  )],

  callback(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("Entities involved")
			.setDescription([
        "**Head developer**: Serge",
        "**Bot developers**: itsakuro, CodingFox, Golem64, ThyTonyStank",
        "**Web developers**: Pigpot, ThyTonyStank",
        "**Helper**: flojo",
        "**Testers**: astolfo, flojo",
        "**Developers who worked in the past**: TechStudent10",
        "\n**Sponsors**: [FyreBlitz Hosting](https://fyreblitz.com)"
      ].join("\n"))
			.setFooter({ text: "Made by the Entity team with 💖" })
			.setColor(getColor(200));
    
    interaction.reply({ embeds: [embed] });
  }
}
