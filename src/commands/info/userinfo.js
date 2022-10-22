const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

module.exports = {
  options: [(
    new SlashCommandBuilder()
      .setName("userinfo")
      .setDescription("Shows your (or someone else's) info.")
      // .addUserOption(user => {
      //   return user
      //     .setName("user")
      //     .setDescription("Select the user that you want to see.")
      //     .setRequired(false)
      // })
  )],

  callback(interaction) {
    const member = interaction.member;
    // const user = interaction.options.getUser("user");
    console.log(member);
    
    const embed = new EmbedBuilder()
      .setTitle(`Info for ${member.nickname}#${interaction.user.discriminator}`)
      .setFooter({ text: `User ID: ${member.id} | Created at: <t:${parseInt(guild.createdTimestamp / 1000)}:d>` })
      .setThumbnail(member.displayAvatarURL())
      .setColor("Random");

    interaction.reply({ embeds: [embed] });
  }
}
