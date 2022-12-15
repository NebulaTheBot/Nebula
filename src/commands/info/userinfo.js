const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { getColor } = require("../../utils/misc");

module.exports = class Userinfo {
  constructor() {
    this.data = new SlashCommandBuilder()
      .setName("userinfo")
      .setDescription("Shows yours (or the user's) info.")
      .addUserOption(user => user
        .setName("user")
        .setDescription("Select the user that you want to see.")
        .setRequired(false)
      );
  }

  async run(interaction) {
    const user = interaction.options.getUser("user");
    const member = interaction.member;
    const guild = member.guild;
    const everyone = guild.roles.everyone;
    const roleDisplayLimit = 5;
    const allMembers = await guild.members.fetch();
    const allRoles = await guild.roles.fetch();

    const selectedMember = allMembers
      .filter(m => m.user.id === user ? user.id : member.user.id)
      .get(user ? user.id : member.user.id);
    const userRoles = [...allRoles.filter(r => r !== everyone && selectedMember._roles.includes(r.id))]
      .sort((a, b) => (b[1].rawPosition)-(a[1].rawPosition));

    let embed = new EmbedBuilder()
      .setTitle(`Showing info for ${selectedMember.user.username}#${selectedMember.user.discriminator}`)
      .addFields(
        {
          name: selectedMember.user.bot === false ? "👤 • User info" : "🤖 • Bot info",
          value: [
            `**Username**: ${selectedMember.user.username}`,
            `**Created on**: <t:${new Date(selectedMember.user.createdAt / 1000).valueOf()}:d>`
          ].join("\n")
        },
        {
          name: "👥 • Member info",
          value: [
            `**Server nickname**: ${selectedMember.nickname == null ? "*None*" : selectedMember.nickname}`,
            `**Joined on**: <t:${parseInt(selectedMember.joinedTimestamp / 1000)}:d>`
          ].join("\n")
        },
        userRoles == [] ? null : {
          name: `🎭 • Roles: ${allRoles.filter(r => r !== everyone && selectedMember._roles.includes(r.id)).size}`,
          value: `${userRoles.slice(0, roleDisplayLimit).map(r => `${r[1]}`).join(", ")}${userRoles.length > roleDisplayLimit ? ` **and ${userRoles.length - roleDisplayLimit} more**` : ""}`
        }
      )
      .setFooter({ text: `User ID: ${selectedMember.id}` })
      .setThumbnail(selectedMember.displayAvatarURL())
      .setColor(getColor(200));

    interaction.editReply({ embeds: [embed] });
  }
}
