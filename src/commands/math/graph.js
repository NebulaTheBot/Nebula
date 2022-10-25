const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { getColor } = require("../../utils/getColors");

module.exports = {
  data: [(
    new SlashCommandBuilder()
      .setName("graph")
      .setDescription("Displays a graph of a function.")
  )],

  callback(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("soon:tm:")
      .setColor(getColor(200));

    interaction.reply({ embeds: [embed] });
  }
}
