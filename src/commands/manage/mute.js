const { EmbedBuilder, SlashCommandSubcommandBuilder, PermissionsBitField } = require("discord.js");
const { getColor } = require("../../utils/misc");
const ms = require("ms");

module.exports = class Mute {
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("mute")
      .setDescription("Mutes the user.")
      .addUserOption(user => user
        .setName("user")
        .setDescription("The user that you want to mute.")
        .setRequired(true)
      )
      .addStringOption(string => string
        .setName("duration")
        .setDescription("The duration.")
        .setRequired(true)
      )
      .addStringOption(string => string
        .setName("reason")
        .setDescription("Reason for the mute.")
        .setRequired(false)
      );
  }

  async run(interaction) {
    let errorEmbed = new EmbedBuilder().setColor(getColor(0));
    const member = interaction.member;
    if (member.user.id !== member.guild.ownerId && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      errorEmbed.setTitle("You don't have the permission to execute this command");
      return interaction.editReply({ embeds: [errorEmbed] });
    }

    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    const duration = interaction.options.getString("duration");
    const channel = interaction.client.channels.cache.get("979337971159420928");
    const allMembers = await member.guild.members.fetch();
    const selectedMember = allMembers.filter(m => m.user.id === user.id).get(user.id);

    let embed = new EmbedBuilder()
      .setTitle(`Muted ${selectedMember.nickname == null ? user.username : selectedMember.nickname}`)
      .addFields(
        { name: "🔨 • Moderator", value: `${member.nickname == null ? member.user.username : member.nickname}` },
        { name: "🕐 • Duration", value: `${ms(ms(duration), { long: true })}` }
      )
      .setFooter({ text: `User ID: ${user.id}` })
      .setColor(getColor(100));

    if (reason) embed.addFields({ name: "🖊️ • Reason", value: `${reason}` });

    if (selectedMember === member) {
      errorEmbed.setTitle("You can't mute yourself.");
      return interaction.editReply({ embeds: [errorEmbed] });
    }

    if (!selectedMember.manageable) {
      errorEmbed.setTitle("Nebula doesn't have the permissions required.");
      return interaction.editReply({ embeds: [errorEmbed] });
    }

    if (member.roles.highest.position < selectedMember.roles.highest.position) {
      errorEmbed.setTitle("The selected member has a higher role position than you.");
      return interaction.editReply({ embeds: [errorEmbed] });
    }

    if (!ms(duration) || ms(duration) > ms("28d")) {
      errorEmbed.setTitle("The duration is invalid or is above the 28 day limit.");
      return interaction.editReply({ embeds: [errorEmbed] });
    }
    
    selectedMember.timeout(ms(duration), reason ? reason : null);
    interaction.editReply({ embeds: [embed] });
    channel.send({ embeds: [embed] });
  }
}
