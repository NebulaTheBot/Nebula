const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

module.exports = {
  options: [(
    new SlashCommandBuilder()
      .setName("warn")
      .setDescription("This command warns a person.")
      .addUserOption(user => {
        return user
          .setName("user")
          .setDescription("The user who is being warned.")
          .setRequired(true)
      })
      .addStringOption(string => {
        return string
          .setName("reason")
          .setDescription("Reason for the warn.")
          .setRequired(false)
      })
  )],

  callback(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("lol this command doesn't do anything")
      .setColor("Random");

    interaction.reply({ embeds: [embed] });
  }
}
