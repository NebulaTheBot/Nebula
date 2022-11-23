const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { getColor } = require("../../utils/misc");

module.exports = class Helloworld {
  constructor() {
		this.data = new SlashCommandBuilder()
			.setName("helloworld")
			.setDescription("Self explanatory.");
  }

  run(interaction) {
    const messages = [
      "Did you try to make me say hello world? Fine... hello world",
      "hello world"
    ];

    const embed = new EmbedBuilder()
      .setTitle(messages[Math.floor(Math.random() * messages.length)])
      .setColor(getColor(270));

    interaction.editReply({ embeds: [embed] });
  }
};
