import { SlashCommandSubcommandBuilder, EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { genColor } from "../../utils/colorGen.js";

export default class User {
  data: SlashCommandSubcommandBuilder;
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("user")
      .setDescription("Shows your (or another user's) info.")
      .addUserOption(option => option
        .setName("user")
        .setDescription("Select the user.")
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user");
    const member = interaction.member;
    const guild = interaction.guild;

    const id = user ? user.id : member.user.id;
    const selectedMember = guild.members.cache.filter((member) => member.user.id === id).map((user) => user)[0];
    const avatarURL = selectedMember.displayAvatarURL();
    const selectedUser = selectedMember.user;

    const guildRoles = guild.roles.cache.filter(role => selectedMember.roles.cache.has(role.id));
    const memberRoles = [...guildRoles].sort((role1, role2) => role2[1].position - role1[1].position);
    memberRoles.pop();
    const rolesOrRole = memberRoles.length === 1 ? "role" : "roles";

    let embed = new EmbedBuilder()
      .setAuthor({
        name: `•  ${selectedMember.nickname == null ? selectedUser.username : selectedMember.nickname}${selectedUser.discriminator == "0" ? "" : `#${selectedUser.discriminator}`}`,
        iconURL: avatarURL
      })
      .setFields(
        {
          name: selectedUser.bot === false ? "👤 • User info" : "🤖 • Bot info",
          value: [
            `**Username**: ${selectedUser.username}`,
            `**Display name**: ${selectedUser.displayName === selectedUser.username ? "*None*" : selectedUser.displayName}`,
            `**Created on** <t:${Math.round(selectedUser.createdAt.valueOf() / 1000)}:D>`,
          ].join("\n"),
        },
        {
          name: "👥 • Member info",
          value: `**Joined on** <t:${Math.round(selectedMember.joinedAt.valueOf() / 1000)}:D>`,
        }
      )
      .setFooter({ text: `User ID: ${selectedMember.id}` })
      .setThumbnail(avatarURL)
      .setColor(genColor(200));

    if (memberRoles.length !== 0) embed.addFields({
      name: `🎭 • ${guildRoles.filter(role => selectedMember.roles.cache.has(role.id)).size - 1} ${rolesOrRole}`,
      value: `${memberRoles
        .slice(0, 5)
        .map(role => `<@&${role[1].id}>`)
        .join(", ")}${memberRoles.length > 5 ? ` **and ${memberRoles.length - 5} more**` : ""}`,
    });

    await interaction.followUp({ embeds: [embed] });
  }
}
