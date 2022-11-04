const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { OWNER, ADMIN } = require("../../../config.json");
const { getColor } = require("../../utils/misc");

module.exports = class Ban {
  constructor() {
    this.data = new SlashCommandBuilder()
      .setName("ban")
      .setDescription("Bans a user.")
      .addUserOption(user => user
        .setName("user")
        .setDescription("The user you want to ban.")
        .setRequired(true)
      )
      .addStringOption(string => string
        .setName("reason")
        .setDescription("The reason of banning.")
        .setRequired(false)
      );
  }
  
  run(interaction) {
    if (interaction.user.id !== OWNER && !ADMIN.includes(interaction.user.id)) return;

    const client = interaction.client;
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    const channel = client.channels.cache.get("979337971159420928");

    const embed = new EmbedBuilder()
      .setTitle("Banned successfully.")
      .setColor(getColor(100));
    
    const embed1 = new EmbedBuilder()
      .setTitle(`Banned ${user}`)
      .addFields(
        { name: "Moderator", value: `${interaction.member.nickname}` },
      )
      .setFooter({ text: `User ID: ${user.id}` })
      .setColor(getColor(100));
    
    if (reason) embed1.addFields({ name: "Reason", value: `${reason}` });

    user.ban();
    interaction.reply({ embeds: [embed], ephemeral: true });
    channel.send({ embeds: [embed1] });
  }
}
