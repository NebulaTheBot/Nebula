const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

module.exports = {
  options: [(
    new SlashCommandBuilder()
      .setName("graph")
      .setDescription("Displays a graph of a function.")
  )],

  callback(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("soon:tm:")
      .setColor("Random");

    interaction.reply({ embeds: [embed] });
  }
}
