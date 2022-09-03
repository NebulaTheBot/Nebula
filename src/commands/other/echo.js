const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
  name: "echo",
  description: "Sends your message in a fancy embed or in a normal message.",
  options: [
    {
      name: "message",
      description: "Sends your message as a normal message.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [{
        name: "content",
        description: "The content of the message.",
        required: true,
        type: ApplicationCommandOptionType.String,
      }],
    },
    {
      name: "embed",
      description: "Sends your message as an embed.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "title",
          description: "The title of an embed.",
          required: true,
          type: ApplicationCommandOptionType.String
        },
        {
          name: "description",
          description: "The description of an embed (small text)",
          required: false,
          type: ApplicationCommandOptionType.String
        }
      ],
    }
  ],

  callback: async interaction => {
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
        .setColor("Blue");

      if (description) embed.setDescription(description);
      
      const embed1 = new EmbedBuilder()
        .setTitle("You have sent a message.")
        .setColor("Green");
      
      await interaction.channel.send({ embeds: [embed] });
      await interaction.reply({ embeds: [embed1], ephemeral: true });
    }
  }
}
