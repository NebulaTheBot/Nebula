const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

module.exports = {
	options: [(
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
      .setColor("Random");

    interaction.reply({ embeds: [embed] });
  }
};
