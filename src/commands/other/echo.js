const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { getColor } = require("../../utils/getColors");

module.exports = {
  data: [(
    new SlashCommandBuilder()
      .setName("echo")
      .setDescription("Sends your message in a fancy embed or in a normal message.")
      .addSubcommand(subcommand => {
        return subcommand
          .setName("message")
          .setDescription("Sends your message as a normal message.")
          .addStringOption(string => {
            return string
              .setName("content")
              .setDescription("The content of the message.")
              .setRequired(true)
          })
      })
      .addSubcommand(subcommand => {
        return subcommand
          .setName("embed")
          .setDescription("Sends your message as an embed.")
          .addStringOption(string => {
            return string
              .setName("title")
              .setDescription("The title of an embed.")
              .setRequired(true)
          })
          .addStringOption(string => {
            return string
              .setName("description")
              .setDescription("The description of an embed. (small text under the title)")
              .setRequired(false)
          })
      })
  )],

  async callback(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const content = interaction.options.getString("content");
    const title = interaction.options.getString("title");
    const description = interaction.options.getString("description");
    const embed1 = new EmbedBuilder()
      .setTitle("You have sent a message.")
      .setColor(getColor(100));

    await interaction.reply({ embeds: [embed1], ephemeral: true });
    if (subcommand === "message") await interaction.channel.send(content);
    else if (subcommand === "embed") {
      let embed = new EmbedBuilder()
        .setTitle(title)
        .setColor(getColor(270));

      if (description) embed.setDescription(description);
      await interaction.channel.send({ embeds: [embed] });
    }
  }
}
