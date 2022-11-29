const { EmbedBuilder, ChannelType, SlashCommandBuilder } = require("discord.js");
const { OWNER, ADMIN } = require("../../../config.json");
const { getColor } = require("../../utils/misc");

module.exports = class Clear {
  constructor() {
    this.data = new SlashCommandBuilder()
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
    if (interaction.user.id !== OWNER && !ADMIN.includes(interaction.user.id)) return;

    const client = interaction.client;
    const amount = interaction.options.getNumber("amount");
    const channel = interaction.options.getChannel("channel");
    const channel1 = client.channels.cache.get("979337971159420928");

    if (amount > 100) {
      const embed = new EmbedBuilder()
        .setTitle("Too many messages provided.")
        .setColor(getColor(0));

      return interaction.editReply({ embeds: [embed], ephemeral: true });
    }

    let embed = new EmbedBuilder()
      .setTitle(`Deleted ${amount} messages!`)
      .setColor(getColor(100));
    
    let embed1 = new EmbedBuilder()
      .setTitle(`Cleared at ${interaction.channel.name}`)
      .addFields(
        { name: "Amount", value: `${amount}` },
        { name: "Moderator", value: `${interaction.member.nickname}` }
      )
      .setColor(getColor(100));

    interaction.editReply({ embeds: [embed], ephemeral: true });

    if (channel) {
      embed.setTitle(`Cleared at ${channel.name}`);
      return channel.bulkDelete(amount, true);
    }
    
    interaction.channel.bulkDelete(amount, true);
    channel1.send({ embeds: [embed1] });
  }
}
