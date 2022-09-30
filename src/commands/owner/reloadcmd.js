const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { OWNER } = require("../../../config.json");

module.exports = {
  options: [
    new SlashCommandBuilder()
      .setName("reloadcmd")
      .setDescription("Reloads the bot's commands and events.")
  ],

  callback: (interaction, _, events) => {
    if (interaction.user.id !== OWNER) return;

    const embed = new EmbedBuilder()
      .setTitle("Reloading... grab some cookies and coffee!")
      .setColor("Random")

    events.reloadEvents();
    interaction.reply({ embeds: [embed] });
  }
}
