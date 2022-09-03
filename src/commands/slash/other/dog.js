const { MessageEmbed } = require("discord.js");
const { r } = require("../../../index");

module.exports = {
    name: "dog",
    description: "This command will send a picture of an adorable dog :D",
    callback: (interaction) => {        
        r.getSubreddit("lookatmydog").getRandomSubmission({ time: "all" }).then(async (submission) => {
            const thumbnail = submission.url;
            const upvotes = submission.ups;

            let embed = new MessageEmbed()
                .setTitle(`${submission.title}`)
                .setColor("RANDOM")
                .setFooter({ text: `Powered by snoowrap. | Upvotes: ${upvotes}` })
        
            if (upvotes == null) {
                embed.setFooter({ text: "Powered by snoowrap. | Upvotes: 0" })
            }

            if (thumbnail == "self") {
                embed.setDescription("The post had no image, sorry.")
                embed.setColor("RED")
            }
            
            if (thumbnail != "self") {
                embed.setImage(`${thumbnail}`)
            }
            interaction.reply({ embeds: [embed] });
        })
    }
};
