const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

module.exports = {
  options: [(
    new SlashCommandBuilder()
      .setName("serverinfo")
      .setDescription("Shows this server's info.")
  )],

  async callback(interaction) {
    const guild = interaction.member.guild;
    console.log(guild);

    const year = guild.createdAt.getFullYear();
    const month = (`0${guild.createdAt.getMonth() + 1}`).slice(-2);
    const day = (`0${guild.createdAt.getDate()}`).slice(-2);
    const fullDate = `${day}/${month}/${year}`;

    const fetchGuildOwner = await guild.fetchOwner();
    const guildOwner = `${fetchGuildOwner.nickname}#${fetchGuildOwner.user.discriminator}`;

    let embed = new EmbedBuilder()
      .setTitle(`Info for ${guild.name}`)
      .addFields([
        { name: "Owner", value: `${guildOwner}`, inline: true },
        { name: "Created at", value: `${fullDate}`, inline: true },
        { name: "Member count", value: `${guild.memberCount}`, inline: true },
        { name: "Boost status", value: `
          Level ${guild.premiumTier +1}
          ${guild.premiumSubscriptionCount}/${guild.premiumTier == 0 ? 2 : guild.premiumTier == 1 ? 7 : 14} boosts
        `, inline: true }
      ])
      .setFooter({ text: `Server ID: ${guild.id}` })
      .setColor("Random");

    interaction.reply({ embeds: [embed] });
  }
}
