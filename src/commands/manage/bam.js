const { EmbedBuilder, SlashCommandSubcommandBuilder } = require("discord.js");
const { OWNER, ADMIN } = require("../../../config.json");
const { getColor } = require("../../utils/misc");

module.exports = class Bam {
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("bam")
      .setDescription("Bams a user.")
      .addUserOption(user => user
        .setName("user")
        .setDescription("The user you want to bam.")
        .setRequired(true)
      )
      .addStringOption(string => string
        .setName("reason")
        .setDescription("The reason of bamming.")
        .setRequired(false)
      );
  }

  async run(interaction) {
    let errorEmbed = new EmbedBuilder().setColor(getColor(0));
    if (interaction.user.id !== OWNER && !ADMIN.includes(interaction.user.id)) {
      errorEmbed.setTitle("You don't have the permission to execute this command");
      return interaction.editReply({ embeds: [errorEmbed] });
    }

    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    const channel = interaction.client.channels.cache.get("979337971159420928");
    const member = interaction.member;
    const everyone = member.guild.roles.everyone;
    const allMembers = await member.guild.members.fetch();
    const allRoles = await member.guild.roles.fetch();
    const selectedMember = allMembers.filter(m => m.user.id === user.id).get(user.id);
    const yes = allRoles.filter(r => r !== everyone && selectedMember._roles.includes(r.id)).sort((a, b) => Math.max([a[1].rawPosition, b[1].rawPosition]));

    let embed = new EmbedBuilder()
      .setTitle(`Bammed ${user.username}#${user.discriminator}`)
      .addFields({ name: "Moderator", value: `${interaction.member.nickname}` })
      .setFooter({ text: `User ID: ${user.id}` })
      .setColor(getColor(100));

    if (reason) embed.addFields({ name: "🖊️ • Reason", value: `${reason}` });

    if (selectedMember === member) {
      errorEmbed.setTitle("You can't bam yourself")
      return interaction.editReply({ embeds: [errorEmbed] });
    }

    if (selectedMember.user.bot === true) {
      errorEmbed.setTitle("You can't bam a bot")
      return interaction.editReply({ embeds: [errorEmbed] });
    }

    if (null) {
      errorEmbed.setTitle("The bot doesn't have the needed permissions or its role is lower than the user's")
      return interaction.editReply({ embeds: [errorEmbed] });
    }

    interaction.editReply({ embeds: [embed] });
    channel.send({ embeds: [embed] });
  }
}
