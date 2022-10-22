const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

module.exports = {
  options: [(
    new SlashCommandBuilder()
      .setName("changelog")
      .setDescription("Shows the changelog for the latest update.")
  )],
  
  callback(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("Changelog for v0.1.0")
      .setDescription([
        "**Added**: /changelog, /credits, /echo (replacement for /embed)",
        "**Work in progress**: /graph, /serverinfo, /userinfo, /rps, /clear, /kick, /warn, /ban",
        "**Changed**: /about",
        "**Removed**: /kill, /idiot, /motivate, /embed, /help",
        [
          "\n**Note**:",
          "This update is the first one to be released to a few other servers and it marks the removal of normal commands. The version number got rounded."
        ].join("\n")
      ].join("\n"))
      .setColor("Random");
    
    interaction.reply({ embeds: [embed] });
  }
}
