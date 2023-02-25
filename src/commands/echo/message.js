const { SlashCommandSubcommandBuilder } = require("discord.js");

module.exports = class Message {
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("message")
      .setDescription("Sends your message as a normal message.")
      .addStringOption(string => string
        .setName("content")
        .setDescription("The content of the message.")
        .setRequired(true)
      )
  }

  async run(interaction) {
    const content = interaction.options.getString("content");
    await interaction.editReply(content);
  }
}
