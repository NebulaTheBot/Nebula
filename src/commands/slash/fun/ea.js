const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "ea",
    description: "This command will tell a joke about EA being money hungry.",
    callback: (interaction) => {
        const messages = ["EA Sports, it's in your wallet!", 
						  "EA Sports, it's in your lack of cash!", 
						  "EA Sports, it's in your credit card!", 
						  "EA Sports, it's in the game! (Good ending)", 
						  "EA Sports, it will buy every EA Sports game with your cash!"]
		const title = messages[Math.floor(Math.random() * messages.length)]

		const embed = new MessageEmbed()
			.setTitle(title)
			.setColor("RANDOM")
		interaction.reply({ embeds: [embed] })
    }
};
