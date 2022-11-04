const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { r } = require("../../constants");
const { getColor } = require("../../utils/misc");

module.exports = class Meme {
  constructor() {
    this.data = new SlashCommandBuilder()
      .setName("meme")
      .setDescription("Sends a random and unfunny meme.");
  }

  run(interaction) {
    r
      .getSubreddit("cleanmemes")
      .getRandomSubmission({ time: "all" })
      .then(submission => {
        const thumbnail = submission.url;
        const upvotes = submission.ups;

        let embed = new EmbedBuilder()
          .setTitle(`${submission.title}`)
          .setFooter({ text: `Powered by snoowrap. | Upvotes: ${upvotes}` })
          .setColor(getColor(270));

        if (upvotes === null) embed.setFooter({ text: "Powered by snoowrap. | Upvotes: 0" });

        if (thumbnail === "self") embed
          .setDescription("The post had no image, sorry.")
          .setColor(getColor(0));

        if (thumbnail !== "self") embed.setImage(`${thumbnail}`);
        interaction.reply({ embeds: [embed] });
      })
  }
}
