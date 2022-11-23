const { EmbedBuilder, SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const { getColor } = require("../../utils/misc");

module.exports = class Info {
  constructor() {
    this.data = new SlashCommandBuilder()
      .setName("info")
      .setDescription("Shows this server's or a user's info.")
      .addSubcommand(subcommand => subcommand
        .setName("server")
        .setDescription("Shows this server's info.")
      )
      .addSubcommand(subcommand => subcommand
        .setName("user")
        .setDescription("Shows this user's info.")
        .addUserOption(user => user
          .setName("user")
          .setDescription("Select the user that you want to see.")
          .setRequired(false)
        )
      );
  }

  async run(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const user = interaction.options.getUser();
    const member = interaction.member;
    const guild = member.guild;
    const roleDisplayLimit = 5;
    let embed = new EmbedBuilder();

    const level = guild.verificationLevel;
    const boostTier = guild.premiumTier;
    const everyone = guild.roles.everyone;
    const allMembers = await guild.members.fetch();
    const allChannels = await guild.channels.fetch();
    const allRoles = await guild.roles.fetch();

    const viewChannel = PermissionsBitField.Flags.ViewChannel;
    const textChannels = allChannels.filter(c => c.type === 0, 15).size;
    const voiceChannels = allChannels.filter(c => c.type === 2).size;
    const hiddenTextChannels = allChannels.filter(c => !c.permissionsFor(everyone).has(viewChannel) && c.type === 0, 15).size;
    const hiddenVoiceChannels = allChannels.filter(c => !c.permissionsFor(everyone).has(viewChannel) && c.type === 2).size;
    const roles = [...allRoles.filter(r => r !== everyone)].sort((a, b) => (b[1].rawPosition)-(a[1].rawPosition));
    const test = allMembers.filter(m => user ? m.user.username === user.username : m.user.username === member.user.username);

    if (subcommand === "server") embed
      .setTitle(`Showing info for ${guild.name}`)
      .addFields(
        {
          name: "📃 | General",
          value: [
            `**Owner**: <@${guild.ownerId}>`,
            `**Created at**: <t:${parseInt(guild.createdTimestamp / 1000)}:d>`,
            `**Security level**: ${level === 0 ? "None" : level === 1 ? "Low" : level === 2 ? "Medium" : level === 3 ? "High" : "Highest"}`,
            `**Community**: ${guild.features.includes("COMMUNITY") ? "Enabled" : "Disabled"}`,
            `**Description**: ${guild.description == null ? "None" : guild.description}`
          ].join("\n")
        },
        {
          name: `👥 | Members: ${guild.memberCount}`,
          value: [
            `**Users**: ${allMembers.filter(m => !m.user.bot).size}`,
            `**Bots**: ${allMembers.filter(m => m.user.bot).size}`
          ].join("\n"),
          inline: true
        },
        {
          name: `📜 | Channels: ${textChannels + voiceChannels}`,
          value: [
            `**Text**: ${textChannels} (hidden: ${hiddenTextChannels})`,
            `**Voice**: ${voiceChannels} (hidden: ${hiddenVoiceChannels})`
          ].join("\n"),
          inline: true
        },
        {
          name: `🌟 | Boosts: ${guild.premiumSubscriptionCount}${boostTier === 0 ? "/2" : boostTier === 1 ? "/7" : boostTier === 2 ? "/14" : null}`,
          value: [
            `**Level**: ${boostTier +1}`,
            `**Boosters**: ${allMembers.filter(m => m.premiumSince).size}`
          ].join("\n"),
          inline: true
        },
        {
          name: `Roles: ${allRoles.filter(r => r !== everyone).size}`,
          value: `${roles.slice(0, roleDisplayLimit).map(r => `${r[1]}`).join(", ")}${roles.length > roleDisplayLimit ? ` **and ${roles.length - roleDisplayLimit} more**` : null}`
        }
      )
      .setFooter({ text: `Server ID: ${guild.id}` })
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setColor(getColor(200));

    else if (subcommand === "user") embed
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
