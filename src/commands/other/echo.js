const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

module.exports = {
  options: [(
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

    if (subcommand === "message") {
      const content = interaction.options.getString("content");

      const embed = new EmbedBuilder()
        .setTitle("You have sent a message.")
        .setColor("Green");

      await interaction.channel.send(content);
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else if (subcommand === "embed") {  
      const title = interaction.options.getString("title");
      const description = interaction.options.getString("description");

      let embed = new EmbedBuilder()
        .setTitle(`${title}`)
        .setColor("Random");

      if (description) embed.setDescription(description);
      
      const embed1 = new EmbedBuilder()
        .setTitle("You have sent a message.")
        .setColor("Green");
      
      await interaction.reply({ embeds: [embed1], ephemeral: true });
      await interaction.channel.send({ embeds: [embed] });
    }
  }
}
