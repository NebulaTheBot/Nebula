const { EmbedBuilder, SlashCommandSubcommandBuilder } = require("discord.js");
const { OWNER, ADMIN } = require("../../../config.json");
const { getColor } = require("../../utils/misc");

module.exports = class Kick {
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("kick")
      .setDescription("Kicks a user.")
      .addUserOption(user => user
        .setName("user")
        .setDescription("The user you want to kick.")
        .setRequired(true)
      )
      .addStringOption(string => string
        .setName("reason")
        .setDescription("The reason of kicking.")
        .setRequired(false)
      );
  }
  
  async run(interaction) {
    let errorEmbed = new EmbedBuilder().setColor(getColor(0));
    if (interaction.user.id !== OWNER && !ADMIN.includes(interaction.user.id)) {
      errorEmbed.setTitle("You don't have the permission to execute this command");
      return interaction.editReply({ embeds: [errorEmbed] });
    }

    const client = interaction.client;
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    const channel = client.channels.cache.get("979337971159420928");
    const member = interaction.member;
    const everyone = member.guild.roles.everyone;
    const allMembers = await member.guild.members.fetch();
    const allRoles = await member.guild.roles.fetch();
    const selectedMember = allMembers.filter(m => m.user.id === user.id).get(user.id);
    // const yes = allRoles.filter(r => r !== everyone && selectedMember._roles.includes(r.id)).sort((a, b) => Math.max([a[1].rawPosition, b[1].rawPosition]));

    const embed = new EmbedBuilder()
      .setTitle(`Kicked ${selectedMember.nickname == null ? user.username : selectedMember.nickname}`)
      .addFields({ name: "🔨 • Moderator", value: `${interaction.member.nickname}` })
      .setFooter({ text: `User ID: ${user.id}` })
      .setColor(getColor(100));

    if (reason) embed.addFields({ name: "🖊️ • Reason", value: `${reason}` });

    if (selectedMember === member) {
      errorEmbed.setTitle("You can't kick yourself")
      return interaction.editReply({ embeds: [errorEmbed] });
    }

    if (selectedMember.user.bot === true) {
      errorEmbed.setTitle("You can't kick a bot")
      return interaction.editReply({ embeds: [errorEmbed] });
    }
    
    if (null) {
      errorEmbed.setTitle("The bot doesn't have the needed permissions or its role is lower than the user's")
      return interaction.editReply({ embeds: [errorEmbed] });
    }

    selectedMember.kick();
    interaction.editReply({ embeds: [embed], ephemeral: true });
    channel.send({ embeds: [embed] });
  }
}
