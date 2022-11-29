const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { getColor, randomise } = require("../../utils/misc");

module.exports = class About {
  constructor() {
    this.data = new SlashCommandBuilder()
      .setName("about")
      .setDescription("Shows information about the bot.");
  }

  run(interaction) {
    const client = interaction.client;

    client.shard.fetchClientValues("guilds.cache.size").then(results => {
      const guildCount = results.reduce((acc, guildCount) => acc + guildCount, 0);
      const hearts = ["💖", "💝", "💓", "💗"];

      const embed = new EmbedBuilder()
        .setTitle("About")
        .setDescription([
          "**Version**: 0.1.0-beta",
          "**Working on**: The Grand Update",
          `**Guild count**: ${guildCount}`
        ].join("\n"))
        .addFields({
          name: "Entities involved",
          value: [
            "**Head developer**: Serge",
            "**Bot developers**: itsakuro, CodingFox, Golem64, ThyTonyStank",
            "**Web developers**: Pigpot, ThyTonyStank",
            "**Helper**: flojo",
            "**Testers**: astolfo, flojo",
            "\n**Sponsors**: [FyreBlitz Hosting](https://fyreblitz.com)"
          ].join("\n")
        })
        .setFooter({ text: `Made by the Entity team with ${randomise(hearts)}` })
        .setColor(getColor(200));

      return interaction.editReply({ embeds: [embed] });
    }).catch(console.error);
  }
}
