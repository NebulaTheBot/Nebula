const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { r } = require("../../constants");
const { getColor } = require("../../utils/misc");

module.exports = class Cat {
  constructor() {
    this.data = new SlashCommandBuilder()
      .setName("cat")
      .setDescription("Sends a random post of r/cats into the chat.");
  }

  run(interaction) {
    r.getSubreddit("Cats").getRandomSubmission({ time: "all" }).then(submission => {
      console.log(submission);
      const media = submission.media;
      const upvotes = submission.ups;
      const URL = submission.url;

      let embed = new EmbedBuilder()
        .setTitle(submission.title)
        .setURL(`https://reddit.com${submission.permalink}`)
        .setFooter({ text: `Powered by snoowrap. | Upvotes: ${upvotes}` })
        .setColor(getColor(270));

      if (upvotes == null) embed.setFooter({ text: "Powered by snoowrap. | Upvotes: 0" });
      if (URL === "self") embed.setDescription("Sorry, there was no image.").setColor(getColor(0));
      if (URL !== "self" && media != null) embed.setImage(`${media.reddit_video.fallback_url}`); 
      if (URL !== "self" && media == null) embed.setImage(`${URL}`);

      interaction.reply({ embeds: [embed] });
    })
  }
}
