const { MessageEmbed } = require("discord.js");

module.exports = {
    callback: (message) => {
        const messages = ["You can do it! I believe in you!",
                          "Problems are not stop signs, they are guidelines.",
                          "Never regret anything that made you smile."]
		const title = messages[Math.floor(Math.random() * messages.length)];
        
		const embed = new MessageEmbed()
		    .setTitle(title)
            .setColor("RANDOM")
		message.channel.send({ embeds: [embed] })
    }
};
