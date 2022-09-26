const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { OWNER } = require("../../../config.json");
const { events } = require("../../index");

module.exports = {
  options: new SlashCommandBuilder()
    .setName("reload")
    .setDescription("Reloads the bot's commands and events."),

  callback: interaction => {
    if (interaction.user.id !== OWNER) return;

    const embed = new EmbedBuilder()
      .setTitle("Restarting... grab some cookies and coffee!")
      .setColor("Random")

    events.reloadEvents();
    interaction.reply({ embeds: [embed] });
  }
}
