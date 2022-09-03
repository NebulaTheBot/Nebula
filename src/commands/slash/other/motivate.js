const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "motivate",
    description: "This command will motivate you to do wonderful things :)",
    callback: (interaction) => {
        const messages = ["You can do it! I believe in you!",
                          "Problems are not stop signs, they are guidelines.",
                          "Never regret anything that made you smile."]
        const title = messages[Math.floor(Math.random() * messages.length)];

        const embed = new MessageEmbed()
            .setTitle(title)
            .setColor("RANDOM")

        interaction.reply({ embeds: [embed] });
    }
};
