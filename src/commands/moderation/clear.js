const { EmbedBuilder, ChannelType, SlashCommandBuilder } = require("discord.js");
const { OWNER, ADMIN } = require("../../../config.json");

module.exports = {
  options: [(
    new SlashCommandBuilder()
      .setName("clear")
      .setDescription("Clears messages.")
      .addNumberOption(number => {
        return number
          .setName("amount")
          .setDescription("The amount of the messages that you want to clear.")
          .setRequired(true)
      })
      .addChannelOption(channel => {
        return channel
          .setName("channel")
          .setDescription("The channel that contains the messages that you want to clear.")
          .setRequired(false)
          .addChannelTypes(ChannelType.GuildText)
      })
  )],

  callback(interaction, client) {
    if (interaction.user.id !== OWNER && !ADMIN.includes(interaction.user.id)) return;

    const amount = interaction.options.getNumber("amount");
    const channel = interaction.options.getChannel("channel");
    const channel1 = client.channels.cache.get("979337971159420928");

    if (amount > 100) {
      const embed = new EmbedBuilder()
        .setTitle("Too many messages provided.")
        .setColor("Red");

      interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    let embed = new EmbedBuilder()
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
    if (channel) return channel.bulkDelete(amount, true);
    interaction.channel.bulkDelete(amount, true);
    channel1.send({ embeds: [embed1] });
  }
}
