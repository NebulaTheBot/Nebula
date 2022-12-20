const { SlashCommandSubcommandBuilder } = require("discord.js");

module.exports = class Message {
  constructor() {
    this.data = SlashCommandSubcommandBuilder()
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
    const embed1 = new EmbedBuilder()
      .setTitle("You have sent a message.")
      .setColor(getColor(100));

    await interaction.editReply({ embeds: [embed1], ephemeral: true });
    await interaction.channel.send(content);
  }
}
