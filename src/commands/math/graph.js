const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { getColor } = require("../../utils/misc");

module.exports = class Graph {
  constructor() {
    this.data = new SlashCommandBuilder()
      .setName("graph")
      .setDescription("Displays a graph of a function.");
  }

  run(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("soon:tm:")
      .setColor(getColor(200));

    interaction.reply({ embeds: [embed] });
  }
}
