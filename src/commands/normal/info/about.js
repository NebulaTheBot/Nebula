const { MessageEmbed } = require("discord.js");

module.exports = {
    callback: (message) => {
        const embed = new MessageEmbed()
			.setTitle("Entity TB")
			.addFields(
				{ name: "Version", value: "0.0000000001" },
				{ name: "Latest update", value: "Slash Commands update" },
				{ name: "State", value: "Alpha build" },
				{ name: "Credits", value: "Owner: Serge" }
			)
			.setColor("RANDOM")
		message.channel.send({ embeds: [embed] })
    }
};
