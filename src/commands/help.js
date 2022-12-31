const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { getColor } = require("../utils/misc");

module.exports = class Help {
  constructor() {
    this.data = new SlashCommandBuilder()
      .setName("help")
      .setDescription("Gives information about commands.");
  }

  async run(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("❓ • Help")
      .setColor(getColor(200))
      .addFields(
        { name: "**/echo**", value:
        "• /echo embed\n\
        • /echo message"},
        { name: "**/game**", value:
        "• /game rps"},
        { name: "**/info**", value:
        "• /info about\n\
        • /info changelog\n\
        • /info server \n\
        • /info user"},
        { name: "**/manage**", value:
        "*👀 • Temporary deleted.*"},
        { name: "**/math**", value: 
        "*👷 • Work in progress.*"}
      );
    
    interaction.editReply({ embeds: [embed]});
    await interaction.deferReply({ ephemeral: true})
  }
}
