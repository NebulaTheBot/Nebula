const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "about",
    description: "This command will show the current version of the bot.",
    callback: (interaction) => {
        const embed = new MessageEmbed()
			.setTitle("Entity TB")
			.addFields(
				{ name: "Version", value: "0.0000000001" },
				{ name: "Latest update", value: "Slash Commands update" },
				{ name: "State", value: "Alpha build" },
				{ name: "Credits", value: "Owner: Serge" }
			)
			.setColor("RANDOM")

        interaction.reply({ embeds: [embed] });
    }
};
