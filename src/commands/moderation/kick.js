const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { OWNER, ADMIN } = require("../../config.json");
const { client } = require("../../index");

module.exports = {
  name: "kick",
  description: "Kicks a user.",
  options: [
    {
      name: "user",
      description: "The user you want to kick.",
      required: true,
      type: ApplicationCommandOptionType.User,
    },
    {
      name: "reason",
      description: "The reason of kicking.",
      required: false,
      type: ApplicationCommandOptionType.String,
    }
  ],

  callback: interaction => {
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
    
    if (reason) embed1.addFields([
      { name: "Reason", value: `${reason}` }
    ]);

    user.kick();
    interaction.reply({ embeds: [embed], ephemeral: true });
    channel.send({ embeds: [embed1] });
  }
}
