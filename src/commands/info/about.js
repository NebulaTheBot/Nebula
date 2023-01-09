const { EmbedBuilder, SlashCommandSubcommandBuilder } = require("discord.js");
const { getColor, randomise } = require("../../utils/misc");

module.exports = class About {
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("about")
      .setDescription("Shows information about the bot.");
  }

  async run(interaction) {
    const client = interaction.client;

    client.shard.fetchClientValues("guilds.cache.size").then(results => {
      const guildCount = results.reduce((acc, guildCount) => acc + guildCount, 0);
      const hearts = ["💖", "💝", "💓", "💗", "💘", "💟", "💕", "💞"];

      const embed = new EmbedBuilder()
        .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
        .setTitle("About")
        .addFields(
          {
            name: "📃 • General",
            value: [
              "**Version**: 0.1-beta",
              "**Working on**: The Grand Update",
              `**Guild count**: ${guildCount}`
            ].join("\n"),
            inline: true
          },
          {
            name: "🌌 • Entities involved",
            value: [
              "**Head developer**: <@725985503177867295>",
              "**Bot developers**: <@620111346129829919>, <@598009398865952768>, <@396374841474809866>, <@349005764247158785>, <@1001860180230819870>, <@820917763240624148>",
              "**Web developers**: <@715602019166978139>, <@349005764247158785>",
              "**Helper**: <@492653578423369740>",
              "**Testers**: <@367638567402340363>, <@492653578423369740>",
              "**Sponsors**: [FyreBlitz](https://fyreblitz.com)"
            ].join("\n")
          }
        )
        .setFooter({ text: `Made by the Nebula team with ${randomise(hearts)}` })
        .setThumbnail(client.user.displayAvatarURL())
        .setColor(getColor(200));

      return interaction.editReply({ embeds: [embed] });
    }).catch(console.error);
  }
}
