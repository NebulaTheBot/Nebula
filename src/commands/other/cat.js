const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { r } = require("../../constants");

module.exports = {
  options: [(
    new SlashCommandBuilder()
      .setName("cat")
      .setDescription("Sends a random post of r/cats into the chat.")
  )],
    
  callback(interaction) {
    r.getSubreddit("Cats")
      .getRandomSubmission({ time: "all" })
      .then(submission => {
        const thumbnail = submission.url;
        const upvotes = submission.ups;

        let embed = new EmbedBuilder()
          .setTitle(`${submission.title}`)
          .setFooter({ text: `Powered by snoowrap. | Upvotes: ${upvotes}` })
          .setColor("Random");

        if (upvotes === null) embed.setFooter({ text: "Powered by snoowrap. | Upvotes: 0" });

        if (thumbnail === "self") embed
          .setDescription("The post had no image, sorry.")
          .setColor("Red");

        if (image !== "self") embed.setImage(`${thumbnail}`);
        interaction.reply({ embeds: [embed] });
      })
  }
}
