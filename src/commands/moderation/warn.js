const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { getColor } = require("../../utils/misc");

module.exports = class Warn {
  constructor() {
    this.data = new SlashCommandBuilder()
      .setName("warn")
      .setDescription("This command warns a person.")
      .addUserOption(user => user
        .setName("user")
        .setDescription("The user who is being warned.")
        .setRequired(true)
      )
      .addStringOption(string => string
        .setName("reason")
        .setDescription("Reason for the warn.")
        .setRequired(false)
      );
  }

  run(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("lol this command doesn't do anything")
      .setColor(getColor(0));

    interaction.reply({ embeds: [embed] });
  }
}
