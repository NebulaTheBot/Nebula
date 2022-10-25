const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { OWNER, ADMIN } = require("../../../config.json");
const { getColor } = require("../../utils/getColors");

module.exports = {
  data: [(
    new SlashCommandBuilder()
      .setName("kick")
      .setDescription("Kicks a user.")
      .addUserOption(user => {
        return user
          .setName("user")
          .setDescription("The user you want to kick.")
          .setRequired(true)
      })
      .addStringOption(string => {
        return string
          .setName("reason")
          .setDescription("The reason of kicking.")
          .setRequired(false)
      })
  )],
  
  callback(interaction) {
    if (interaction.user.id !== OWNER && !ADMIN.includes(interaction.user.id)) return;

    client = interaction.client;
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    const channel = client.channels.cache.get("979337971159420928");

    const embed = new EmbedBuilder()
      .setTitle("Kicked successfully.")
      .setColor(getColor(100));
    
    const embed1 = new EmbedBuilder()
      .setTitle(`Kicked ${user}`)
      .addFields(
        { name: "Moderator", value: `${interaction.member.nickname}` },
      )
      .setFooter({ text: `User ID: ${user.id}` })
      .setColor(getColor(100));
    
    if (reason) embed1.addFields({ name: "Reason", value: `${reason}` });

    user.kick();
    interaction.reply({ embeds: [embed], ephemeral: true });
    channel.send({ embeds: [embed1] });
  }
}
