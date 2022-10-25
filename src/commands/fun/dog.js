const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { r } = require("../../constants");
const { getColor } = require("../../utils/getColors");

module.exports = {
  data: [(
    new SlashCommandBuilder()
      .setName("dog")
      .setDescription("Sends a random post of r/lookatmydog into the chat.")
  )],
    
  callback(interaction) {
    r.getSubreddit("lookatmydog")
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
