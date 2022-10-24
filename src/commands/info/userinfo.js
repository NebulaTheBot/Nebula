const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { infoColors } = require("../../constants");

module.exports = {
  options: [(
    new SlashCommandBuilder()
      .setName("userinfo")
      .setDescription("Shows your (or someone else's) info.")
      .addUserOption(user => {
        return user
          .setName("user")
          .setDescription("Select the user that you want to see.")
          .setRequired(false)
      })
  )],

  callback(interaction) {
    const member = interaction.member;
    const user = interaction.options.getUser("user");
    
    const embed = new EmbedBuilder()
      .setTitle(`Info for ${member.user.username}#${member.user.discriminator}`)
      .addFields([
        {
          name: `Username: ${member.user.username}`,
          value: `**Server nickname**: ${member.nickname}`,
          inline: true
        },
        {
          name: `Created at: <t:${new Date(member.user.createdAt / 1000).valueOf()}:d>`,
          value: `**Joined at**: <t:${parseInt(member.joinedTimestamp / 1000)}:d>`,
          inline: true
        }
      ])
      .setFooter({ text: `User ID: ${member.id}` })
      .setThumbnail(member.displayAvatarURL())
      .setColor(infoColors[Math.floor(Math.random() * infoColors.length)]);

    interaction.reply({ embeds: [embed] });
  }
}
