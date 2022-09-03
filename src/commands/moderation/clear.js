const { EmbedBuilder, ApplicationCommandOptionType, ChannelType } = require("discord.js");
const { OWNER, ADMIN } = require("../../config.json");
const { client } = require("../../index");

module.exports = {
  name: "clear",
  description: "Clears messages.",
  options: [
    {
      name: "amount",
      description: "The amount of the messages that you want to clear.",
      required: true,
      type: ApplicationCommandOptionType.Number,
    },
    {
      name: "channel",
      description: "The channel that contains the messages that you want to clear.",
      required: true,
      type: ApplicationCommandOptionType.Channel,
      channelTypes: [ChannelType.GuildText],
    }
  ],

  callback: interaction => {
    if (interaction.user.id !== OWNER && !ADMIN.includes(interaction.user.id)) return;
    
    const amount = interaction.options.getNumber("amount");
    const channel = interaction.options.getChannel("channel");
    const channel1 = client.channels.cache.get("979337971159420928");

    const embed = new EmbedBuilder()
      .setTitle(`Deleted ${amount} messages!`)
      .setColor("Green");

    const embed1 = new EmbedBuilder()
      .setTitle(`Cleared at ${channel.name}`)
      .addFields([
        { name: "Amount", value: `${amount}` },
        { name: "Moderator", value: `${interaction.member.nickname}` }
      ])
      .setColor("Green");

    interaction.reply({ embeds: [embed], ephemeral: true });
    channel.bulkDelete(amount, true);
    channel1.send({ embeds: [embed1] });
  }
}
