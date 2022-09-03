const { MessageEmbed } = require("discord.js");

module.exports = {
    callback: (message, ...args) => {
		const fun = "ea, helloworld, idiot, kill, meme";
		const other = "cat, dog, embed, motivate";
		const info = "about";
        let embed = new MessageEmbed()
			.setColor("RANDOM")

		if (args[0] == "ea") {
			embed.setTitle("ea")
			embed.addFields({ name: "Description", value: "This command will tell a joke about EA being money hungry." })
		} else if (args[0] == "helloworld") {
			embed.setTitle("helloworld")
			embed.addFields({ name: "Description", value: "This command is self explanatory." })
		} else if (args[0] == "idiot") {
			embed.setTitle("idiot")
			embed.addFields(
				{ name: "Description", value: "This command will call someone ~~a sussy baka~~ an idiot." },
				{ name: "Usage", value: "e!idiot @member" }
			)
		} else if (args[0] == "kill") {
			embed.setTitle("kill")
			embed.addFields(
				{ name: "Description", value: "This command will ~~kill~~ send recipes to kill someone." },
				{ name: "Usage", value: "e!kill @member" }
			)
		} else if (args[0] == "meme") {
			embed.setTitle("meme")
			embed.addFields({ name: "Description", value: "This command will send ~~JOE MAMA!!!~~ a funny meme." })
		} else if (args[0] == "cat") {
			embed.setTitle("cat")
			embed.addFields({ name: "Description", value: "This command will send a picture of an adorable cat :D" })
		} else if (args[0] == "dog") {
			embed.setTitle("dog")
			embed.addFields({ name: "Description", value: "This command will send a picture of an adorable dog :D" })
		} else if (args[0] == "embed") {
			embed.setTitle("embed")
			embed.addFields({ name: "Description", value: "This command will send your message in a fancy embed." })
		} else if (args[0] == "motivate") {
			embed.setTitle("motivate")
			embed.addFields({ name: "Description", value: "This command will motivate you to do wonderful things :)" })
		} else if (args[0] == "about") {
			embed.setTitle("about")
			embed.addFields({ name: "Description", value: "This command will show the current version of the bot." })
		} else {
			embed.setTitle("Help")
			embed.addFields(
				{ name: "Caution", value: "This bot is in an early stage of development, don't expect much!" },
				{ name: "Prefix", value: "/, e!, E!" },
				{ name: "Entertainment", value: fun },
				{ name: "Other", value: other },
				{ name: "Info", value: info }
			)
			embed.setFooter({ text: "Type 'e!help [command]' for the information about the command." })
		}
		message.channel.send({ embeds: [embed] })
    }
};
