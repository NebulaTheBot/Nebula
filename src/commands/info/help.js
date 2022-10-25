const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { getColor } = require("../../utils/getColors");

module.exports = {
  data: [(
    new SlashCommandBuilder()
      .setName("help")
      .setDescription("Gives information about commands.")
  )],

  callback(interaction) {
    interaction.reply("lazy to rewrite this command fully by myself");
  }
}
