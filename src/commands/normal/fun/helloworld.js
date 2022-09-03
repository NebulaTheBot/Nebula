const { MessageEmbed } = require("discord.js");

module.exports = {
    callback: (message) => {
        const messages = ["Did you try to make hello world? Fine... hello world",
                          "hello world"]
        const title = messages[Math.floor(Math.random() * messages.length)];

        const embed = new MessageEmbed()
            .setTitle(title)
            .setColor("RANDOM")
        message.channel.send({ embeds: [embed] })
    }
};
