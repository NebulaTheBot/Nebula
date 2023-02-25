const { EmbedBuilder, SlashCommandSubcommandBuilder, PermissionsBitField } = require("discord.js");
const { getColor } = require("../../utils/misc");

module.exports = class Unban {
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("unban")
      .setDescription("Unbans a user.")
      .addStringOption(string => string
        .setName("id")
        .setDescription("The ID of the user that you want to unban.")
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

    const id = interaction.options.getString("id");
    const channel = interaction.client.channels.cache.get("979337971159420928");
    const bannedUsers = await interaction.guild.bans.fetch();
    const bannedUserArray = bannedUsers.map(user => user.user);
    const selectedBannedUser = bannedUserArray.filter(user => user.id === id)[0];

    if (selectedBannedUser == undefined) {
      errorEmbed.setTitle("You can't unban this user, as they were never banned.");
      return interaction.editReply({ embeds: [errorEmbed] });
    }

    const embed = new EmbedBuilder()
      .setTitle(`${selectedBannedUser.username} is unbanned.`)
      .addFields({ name: "🔨 • Moderator", value: `${member.nickname == null ? member.user.username : member.nickname}` })
      .setFooter({ text: `User ID: ${selectedBannedUser.id}` })
      .setColor(getColor(100));

    if (selectedMember === member) {
      errorEmbed.setTitle("You can't unban yourself.");
      return interaction.editReply({ embeds: [errorEmbed] });
    }

    interaction.guild.members.unban(id);
    interaction.editReply({ embeds: [embed] });
    channel.send({ embeds: [embed] });
  }
}
