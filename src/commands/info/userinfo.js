const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { getColor } = require("../../utils/misc");

module.exports = class Userinfo {
  constructor() {
    this.data = new SlashCommandBuilder()
      .setName("userinfo")
      .setDescription("Shows your (or someone else's) info.")
      .addUserOption(user => user
        .setName("user")
        .setDescription("Select the user that you want to see.")
        .setRequired(false)
      );
  }

  async callback(interaction) {
    const member = interaction.member;
    const user = interaction.data.getUser("user");

    const allMembers = await member.guild.members.fetch();
    const allRoles = await member.guild.roles.fetch();

    const test = allMembers.filter(m => user ? m.user.username === user.username : m.user.username === member.user.username);
    
    let embed = new EmbedBuilder()
      .setTitle(`Info for ${user ? `${test.username}#${test.discriminator}` : `${member.user.username}#${member.user.discriminator}`}`)
      .addFields(
        {
          name: "User info",
          value: [
            `**Username**: ${member.user.username}`,
            `**Created at**: <t:${new Date(member.user.createdAt / 1000).valueOf()}:d>`
          ].join("\n"),
          inline: true
        },
        {
          name: "Member info",
          value: [
            `**Server nickname**: ${member.nickname}`,
            `**Joined at**: <t:${parseInt(member.joinedTimestamp / 1000)}:d>`
          ].join("\n"),
          inline: true
        }
      )
      .setFooter({ text: `User ID: ${member.id}` })
      .setThumbnail(member.displayAvatarURL())
      .setColor(getColor(200));

    interaction.editReply({ embeds: [embed] });
  }
}
