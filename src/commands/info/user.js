const { EmbedBuilder, SlashCommandSubcommandBuilder } = require("discord.js");
const { getColor } = require("../../utils/misc");

module.exports = class User {
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("user")
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

    const memberRoles = [...allRoles.filter(r => r !== everyone && selectedMember._roles.includes(r.id))]
      .sort((a, b) => (b[1].rawPosition)-(a[1].rawPosition));

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `•  ${selectedMember.nickname == null ? selectedMember.user.username : selectedMember.nickname}#${selectedMember.user.discriminator}`,
        iconURL: selectedMember.displayAvatarURL()
      })
      .addFields(
        {
          name: selectedMember.user.bot === false ? "👤 • User info" : "🤖 • Bot info",
          value: [
            `**Username**: ${selectedMember.user.username}`,
            `**Created on** <t:${new Date(selectedMember.user.createdAt / 1000).valueOf()}:D>`
          ].join("\n")
        },
        {
          name: "👥 • Member info",
          value: [
            `**Server nickname**: ${selectedMember.nickname == null ? "*None*" : selectedMember.nickname}`,
            `**Joined on** <t:${parseInt(selectedMember.joinedTimestamp / 1000)}:D>`
          ].join("\n")
        }
      )
      .setFooter({ text: `User ID: ${selectedMember.id}` })
      .setThumbnail(selectedMember.displayAvatarURL())
      .setColor(getColor(200));

    if (memberRoles.length != 0) embed.addFields({
      name: `🎭 • Roles: ${allRoles.filter(r => r !== everyone && selectedMember._roles.includes(r.id)).size}`,
      value: `${memberRoles.slice(0, roleDisplayLimit).map(r => `${r[1]}`).join(", ")}${memberRoles.length > roleDisplayLimit ? ` **and ${memberRoles.length - roleDisplayLimit} more**` : ""}`
    })

    interaction.editReply({ embeds: [embed] });
  }
}