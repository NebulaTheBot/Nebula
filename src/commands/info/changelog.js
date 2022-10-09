const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

module.exports = {
  options: [(
    new SlashCommandBuilder()
      .setName("changelog")
      .setDescription("Shows the changelog for the latest update.")
  )],
  
  callback(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("Changelog for v0.2")
      .addFields([
        { name: "Added commands", value: `
          /changelog
        `},
        { name: "Work in progress", value: `
          /serverinfo
          /userinfo
          /warn
        `}
      ])
      .setColor("Random");
    
    interaction.reply({ embeds: [embed] });
  }
}
