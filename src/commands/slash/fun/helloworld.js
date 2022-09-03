const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "helloworld",
    description: "This command is self explanatory.",
    callback: (interaction) => {
        const messages = ["Did you try to make hello world? Fine... hello world",
                          "hello world"]
        const title = messages[Math.floor(Math.random() * messages.length)]
        
        const embed = new MessageEmbed()
            .setTitle(title)
            .setColor("RANDOM")
        interaction.reply({ embeds: [embed] });
    }
};
