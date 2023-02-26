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
        .setAuthor({ name: `•  About ${client.user.username}`, iconURL: client.user.displayAvatarURL() })
        .addFields(
          {
            name: "📃 • General",
            value: [
              "**Version**: 0.1-beta",
              `**Guild count**: ${guildCount}`
            ].join("\n"),
            inline: true
          },
          {
            name: "🌌 • Entities involved",
            value: [
              "**Head developer**: <@725985503177867295>",
              "**Developers**: <@620111346129829919>, <@598009398865952768>, <@396374841474809866>, <@656426344325840936>, <@851210524254928907>, <@349005764247158785>, <@1001860180230819870>, <@820917763240624148>, <@715602019166978139>",
              "**Designers**: <@807903704472223754>, <@598009398865952768>",
              "**Translators**: <@598009398865952768>, <@396374841474809866>, <@820917763240624148>, <@807903704472223754>, <@725985503177867295>, <@656426344325840936>, <@958981729153089566>",
              "**Helper**: <@492653578423369740>",
              "**Testers**: <@367638567402340363>, <@492653578423369740>",
            ].join("\n")
          },
          {
            name: "💵 • Sponsors",
            value: [
              "[FyreBlitz](https://fyreblitz.com/en)"
            ].join("\n")
          }
        )
        .setFooter({ text: `Made by the Nebula team with ${randomise(hearts)}` })
        .setThumbnail(client.user.displayAvatarURL())
        .setColor(getColor(200));

      return interaction.editReply({ embeds: [embed] });
    });
  }
}
