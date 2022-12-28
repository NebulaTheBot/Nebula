const { SlashCommandSubcommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = class Embed {
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("embed")
      .setDescription("Sends your message as an embed.")
      .addStringOption(string => string
        .setName("title")
        .setDescription("The title of an embed.")
        .setRequired(true)
      )
      .addStringOption(string => string
        .setName("description")
        .setDescription("The description of an embed. (small text under the title)")
        .setRequired(false)
      )
  }

  async run(interaction) {
    const title = interaction.options.getString("title");
    const description = interaction.options.getString("description");
    let embed = new EmbedBuilder()
      .setTitle("You have sent a message.")
      .setColor(getColor(100));

    await interaction.editReply({ embeds: [embed], ephemeral: true });

    embed.setTitle(title).setColor(getColor(270));
    if (description) embed.setDescription(description);
    await interaction.channel.send({ embeds: [embed] });
  }
}
