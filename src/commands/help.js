const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { getColor } = require("../utils/misc");

module.exports = class Help {
  constructor() {
    this.data = new SlashCommandBuilder()
      .setName("help")
      .setDescription("Gives information about commands.");
  }

  run(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("lazy to rewrite this command fully by myself")
      .setColor(getColor(200));

    interaction.editReply({ embeds: [embed] });
  }
}
