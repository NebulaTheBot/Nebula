const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "about",
  description: "Shows information about the bot.",
  callback: interaction => {
    const embed = new EmbedBuilder()
			.setTitle("Entity Canary")
			.addFields([
				{ name: "Version", value: "0.00000001", inline: true },
				{ name: "Latest update", value: "The Grand update", inline: true },
				{ name: "State", value: "Alpha" },
				{ name: "Entities involved", value: "**Owner**\nSerge\n**Developer**\nThyTonyStank\n**Helper**\nflojo\n**Testers**\nastolfo, flojo" }
			])
			.setColor("Blue");

    interaction.reply({ embeds: [embed] });
  }
}
