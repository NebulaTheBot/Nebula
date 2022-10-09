const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

module.exports = {
  options: [(
    new SlashCommandBuilder()
      .setName("userinfo")
      .setDescription("Shows your (or someone else's) info.")
      .addUserOption(user => {
        return user
          .setName("user")
          .setDescription("Select the user that you want to see.")
          .setRequired(false)
      })
  )],

  callback(interaction) {
    const user = interaction.options.getUser("user");
    console.log(user);
    
    const embed = new EmbedBuilder()
      .setTitle(`${interaction.member.nickname}#${interaction.user.discriminator}`)
      .setColor("Random");

    if (user) embed.setTitle(``)

    interaction.reply({ embeds: [embed] });
  }
}
