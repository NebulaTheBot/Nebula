const { EmbedBuilder, SlashCommandSubcommandBuilder, PermissionsBitField } = require("discord.js");
const { getColor } = require("../../utils/misc");

module.exports = class Unmute {
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("unmute")
      .setDescription("Unmutes the user.")
      .addUserOption(user => user
        .setName("user")
        .setDescription("The user that you want to unmute.")
        .setRequired(true)  
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
    const channel = interaction.client.channels.cache.get("979337971159420928");
    const allMembers = await member.guild.members.fetch();
    const selectedMember = allMembers.filter(m => m.user.id === user.id).get(user.id);

    const embed = new EmbedBuilder()
      .setTitle(`Unmuted ${selectedMember.nickname == null ? user.username : selectedMember.nickname}`)
      .addFields({ name: "🔨 • Moderator", value: `${member.nickname == null ? member.user.username : member.nickname}` })
      .setFooter({ text: `User ID: ${user.id}` })
      .setColor(getColor(100));

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

    selectedMember.timeout(null);
    interaction.editReply({ embeds: [embed] });
    channel.send({ embeds: [embed] });
  }
}
