const {
  EmbedBuilder, ChannelType, SlashCommandSubcommandBuilder,
  PermissionsBitField
} = require("discord.js");
const { getColor } = require("../../utils/misc");

module.exports = class Clear {
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("clear")
      .setDescription("Clears messages.")
      .addNumberOption(number => number
        .setName("amount")
        .setDescription("The amount of the messages that you want to clear.")
        .setRequired(true)
      )
      .addChannelOption(channel => channel
        .setName("channel")
        .setDescription("The channel that contains the messages that you want to clear.")
        .setRequired(false)
        .addChannelTypes(ChannelType.GuildText)
      );
  }

  run(interaction) {
    let errorEmbed = new EmbedBuilder().setColor(getColor(0));
    const member = interaction.member;
    if (member.user.id !== member.guild.ownerId && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      errorEmbed.setTitle("You don't have the permission to execute this command");
      return interaction.editReply({ embeds: [errorEmbed] });
    }

    const amount = interaction.options.getNumber("amount");
    const channel = interaction.options.getChannel("channel");
    const channel1 = interaction.client.channels.cache.get("979337971159420928");

    let embed = new EmbedBuilder()
      .setTitle(`Cleared at ${interaction.channel.name}`)
      .addFields(
        { name: "🔨 • Moderator", value: `${member.nickname == null ? member.user.username : member.nickname}` },
        { name: "🔢 • Amount", value: `${amount}` }
      )
      .setColor(getColor(100));

    if (amount > 1000) {
      errorEmbed.setTitle("Too many messages provided.");
      return interaction.editReply({ embeds: [errorEmbed] });
    }

    if (channel) {
      embed.setTitle(`Cleared at ${channel.name}`);
      return channel.bulkDelete(amount, true);
    }

    interaction.channel.bulkDelete(amount, true);
    interaction.editReply({ embeds: [embed] });
    channel1.send({ embeds: [embed] });
  }
}
