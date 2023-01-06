const { EmbedBuilder, SlashCommandSubcommandBuilder, PermissionsBitField } = require("discord.js");
const { getColor } = require("../../utils/misc");

module.exports = class Server {
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("server")
      .setDescription("Shows this server's info.");
  }

  async run(interaction) {
    const guild = interaction.member.guild;
    const level = guild.verificationLevel;
    const nsfwLevel = guild.explicitContentFilter;
    const boostTier = guild.premiumTier;
    const everyone = guild.roles.everyone;
    const allMembers = await guild.members.fetch();
    const allChannels = await guild.channels.fetch();
    const allRoles = await guild.roles.fetch();

    const roleDisplayLimit = 5;
    const viewChannel = PermissionsBitField.Flags.ViewChannel;
    const textChannels = allChannels.filter(c => c.type === 0, 15).size;
    const voiceChannels = allChannels.filter(c => c.type === 2).size;
    const hiddenTextChannels = allChannels.filter(c => !c.permissionsFor(everyone).has(viewChannel) && c.type === 0, 15).size;
    const hiddenVoiceChannels = allChannels.filter(c => !c.permissionsFor(everyone).has(viewChannel) && c.type === 2).size;
    const boosters = allMembers.filter(m => m.premiumSince).size;
    const roles = [...allRoles].sort((a, b) => (b[1].rawPosition)-(a[1].rawPosition));

    const embed = new EmbedBuilder()
      .setAuthor({ name: `•  ${guild.name}`, iconURL: guild.iconURL({ dynamic: true }) })
      .addFields(
        {
          name: "📃 • General",
          value: [
            `**Owner**: <@${guild.ownerId}>`,
            `**Created on** <t:${parseInt(guild.createdTimestamp / 1000)}:D>`
          ].join("\n"),
          inline: true
        },
        {
          name: "🛡 • Security",
          value: [
            `**Security level**: ${level === 0 ? "*None*" : level === 1 ? "Low" : level === 2 ? "Medium" : level === 3 ? "High" : "Highest"}`,
            `**NSFW protection**: ${nsfwLevel === 0 ? "*None*" : nsfwLevel === 1 ? "Medium" : "High"}`
          ].join("\n"),
          inline: true
        },
        {
          name: `🎭 • Roles: ${allRoles.size}`,
          value: roles.length == 0 ? "*None*" : `${roles.slice(0, roleDisplayLimit).map(r => `${r[1]}`).join(", ")}${roles.length > roleDisplayLimit ? ` **and ${roles.length - roleDisplayLimit} more**` : ""}`
        },
        {
          name: `👥 • Members: ${guild.memberCount}`,
          value: [
            `${allMembers.filter(m => !m.user.bot).size} users • ${allMembers.filter(m => m.user.bot).size} bots`,
            `${allMembers.filter(m => !m.user.bot && m.presence?.status).size} online`
          ].join("\n"),
          inline: true
        },
        {
          name: `🗨️ • Channels: ${textChannels + voiceChannels}`,
          value: [
            `${textChannels} text • ${voiceChannels} voice`,
            `${hiddenTextChannels} • ${hiddenVoiceChannels} hidden`
          ].join("\n"),
          inline: true
        },
        {
          name: `🌟 • Boosts: ${guild.premiumSubscriptionCount}${boostTier === 0 ? "/2" : boostTier === 1 ? "/7" : boostTier === 2 ? "/14" : ""}`,
          value: [
            boostTier == 0 ? null : `Level ${boostTier}`,
            `${boosters}yeah
             ${boosters === 1 ? "booster" : "boosters"}`
          ].join("\n"),
          inline: true
        }
      )
      .setFooter({ text: `Server ID: ${guild.id}` })
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setColor(getColor(200));

    interaction.editReply({ embeds: [embed] });
  }
}
