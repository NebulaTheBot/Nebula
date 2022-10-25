const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { getColor } = require("../../utils/getColors");

module.exports = {
	data: [(
		new SlashCommandBuilder()
			.setName("helloworld")
			.setDescription("Self explanatory.")
	)],

  callback(interaction) {
    const messages = [
      "Did you try to make me say hello world? Fine... hello world",
      "hello world"
    ];

    const embed = new EmbedBuilder()
      .setTitle(messages[Math.floor(Math.random() * messages.length)])
      .setColor(getColor(270));

    interaction.reply({ embeds: [embed] });
  }
};
