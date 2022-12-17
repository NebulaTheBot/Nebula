const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { getColor, randomise } = require("../../utils/misc");

module.exports = class About {
  constructor() {
    this.data = new SlashCommandBuilder()
      .setName("about")
      .setDescription("Shows information about the bot.");
  }

  async run(interaction) {
    const client = interaction.client;

    client.shard.fetchClientValues("guilds.cache.size").then(results => {
      const guildCount = results.reduce((acc, guildCount) => acc + guildCount, 0);
      const hearts = ["💖", "💝", "💓", "💗", "💘", "💟", "💕", "💞"];

      const embed = new EmbedBuilder()
        .setTitle("About")
        .addFields(
          {
            name: "📃 • General",
            value: [
              "**Version**: 0.1.0-beta",
              "**Working on**: The Grand Update",
              `**Guild count**: ${guildCount}`
            ].join("\n"),
            inline: true
          },
          {
            name: "🌌 • Entities involved",
            value: [
              "**Head developer**: <@725985503177867295>",
              "**Bot developers**: <@620111346129829919>, <@598009398865952768>, <@396374841474809866>, <@349005764247158785>",
              "**Web developers**: <@715602019166978139>, <@349005764247158785>",
              "**Helper**: <@492653578423369740>",
              "**Testers**: <@367638567402340363>, <@492653578423369740>",
              "**Sponsors**: [FyreBlitz Hosting](https://fyreblitz.com)"
            ].join("\n")
          }
        )
        .setFooter({ text: `Made by the Entity team with ${randomise(hearts)}` })
        .setThumbnail(client.user.displayAvatarURL())
        .setColor(getColor(200));

      return interaction.editReply({ embeds: [embed] });
    }).catch(console.error);
  }
}
