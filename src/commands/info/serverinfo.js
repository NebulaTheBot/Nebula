const { EmbedBuilder, SlashCommandBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  options: [(
    new SlashCommandBuilder()
      .setName("serverinfo")
      .setDescription("Shows this server's info.")
  )],

  async callback(interaction) {
    const guild = interaction.member.guild;
    const level = guild.verificationLevel;
    const tier = guild.premiumTier;
    const viewChannel = PermissionsBitField.Flags.ViewChannel;

    const allMembers = await guild.members.fetch();
    const allChannels = await guild.channels.fetch();
    const allRoles = await guild.roles.fetch();

    const everyone = allRoles.find(r => r.name === "@everyone");
    const textChannels = allChannels.filter(c => c.type === 0).size;
    const voiceChannels = allChannels.filter(c => c.type === 2).size;
    const forumChannels = allChannels.filter(c => c.type === 15).size;
    const hiddenTextChannels = allChannels.filter(c => c.type === 0 && !c.permissionsFor(everyone).has(viewChannel)).size;
    const hiddenVoiceChannels = allChannels.filter(c => c.type === 2 && !c.permissionsFor(everyone).has(viewChannel)).size;
    const hiddenForumChannels = allChannels.filter(c => c.type === 15 && !c.permissionsFor(everyone).has(viewChannel)).size;

    const embed = new EmbedBuilder()
      .setTitle(`Showing info for ${guild.name}`)
      .addFields([
        {
          name: "General info",
          value: [
            `**Description**: ${guild.description == null ? "None" : guild.description}`,
            `**Owner**: <@${guild.ownerId}>`,
            `**Created at**: <t:${parseInt(guild.createdTimestamp / 1000)}:d>`,
          ].join("\n")
        },
        {
          name: "Members",
          value: [
            `**Total**: ${guild.memberCount}`,
            `**Users**: ${allMembers.filter(m => !m.user.bot).size}`,
            `**Bots**: ${allMembers.filter(m => m.user.bot).size}`
          ].join("\n"),
          inline: true
        },
        {
          name: "Channels",
          value: [
            `**Total**: ${textChannels + voiceChannels + forumChannels}`,
            `**Text channels**: ${textChannels + forumChannels} (hidden: ${hiddenTextChannels + hiddenForumChannels})`,
            `**Voice channels**: ${voiceChannels} (hidden: ${hiddenVoiceChannels})`,
          ].join("\n"),
          inline: true
        },
        {
          name: "Boost status",
          value: [
            `**Level**: ${guild.premiumTier +1}`,
            `**Boosts**: ${guild.premiumSubscriptionCount}/${tier === 0 ? 2 : tier === 1 ? 7 : 14}`,
            `**Boosters**: ${allMembers.filter(m => m.premiumSince).size}`
          ].join("\n"),
          inline: true
        },
        {
          name: "Additional info",
          value: [
            `**Security level**: ${level === 0 ? "None" : level === 1 ? "Low" : level === 2 ? "Medium" : level === 3 ? "High" : "Highest"}`,
            `**Community**: ${guild.features.includes("COMMUNITY") ? "Enabled" : "Disabled"}`
          ].join("\n")
        }
      ])
      .setFooter({ text: `Server ID: ${guild.id}` })
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setColor("Random");

    interaction.reply({ embeds: [embed] });
  }
}
