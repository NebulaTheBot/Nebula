const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { getColor } = require("../../utils/getColors");

module.exports = {
	data: [(
		new SlashCommandBuilder()
			.setName("ea")
			.setDescription("Tells a joke about EA being money hungry.")
	)],

  callback(interaction) {
    const messages = [
			"EA Sports, it's in your wallet!", 
			"EA Sports, it's in your lack of cash!", 
			"EA Sports, it's in your credit card!", 
			"EA Sports, it's in the game! (Good ending)", 
			"EA Sports, it will buy every EA Sports game with your cash!",
			"EA Sports, it's not in the game!",
		];

		const embed = new EmbedBuilder()
			.setTitle(messages[Math.floor(Math.random() * messages.length)])
			.setColor(getColor(0));
		
		interaction.reply({ embeds: [embed] });
  }
}
