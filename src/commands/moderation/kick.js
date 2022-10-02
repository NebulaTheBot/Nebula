const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { OWNER, ADMIN } = require("../../../config.json");

module.exports = {
  options: [(
    new SlashCommandBuilder()
      .setName("kick")
      .setDescription("The user you want to kick.")
      .addUserOption(user => {
        return user
          .setName("user")
          .setDescription("The user you want to kick")
          .setRequired(true)
      })
      .addStringOption(string => {
        return string
          .setName("reason")
          .setDescription("The reason of kicking.")
          .setRequired(false)
      })
  )],
  
  callback(interaction, client) {
    if (interaction.user.id !== OWNER && !ADMIN.includes(interaction.user.id)) return;

    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    const channel = client.channels.cache.get("979337971159420928");

    const embed = new EmbedBuilder()
      .setTitle("Kicked successfully.")
      .setColor("Green");
    
    const embed1 = new EmbedBuilder()
      .setTitle(`Kicked ${user}`)
      .addFields([
        { name: "Moderator", value: `${interaction.member.nickname}` },
      ])
      .setFooter({ text: `User ID: ${user.id}` })
      .setColor("Green");
    
    if (reason) embed1.addFields([{ name: "Reason", value: `${reason}` }]);

    user.kick();
    interaction.reply({ embeds: [embed], ephemeral: true });
    channel.send({ embeds: [embed1] });
  }
}
