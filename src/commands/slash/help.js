const { MessageEmbed, Constants } = require("discord.js");

module.exports = {    
    name: "help",
    description: "This command will show all the commands in the bot.",
    options: [
        {
            name: "command",
            description: "Will show you how to use a specific command.",
            required: false,
            type: Constants.ApplicationCommandOptionTypes.STRING,
            choices: [
                {
                    name: "ea",
                    value: "ea"
                },
                {
                    name: "helloworld",
                    value: "helloworld"
                },
                {
                    name: "idiot",
                    value: "idiot"
                },
                {
                    name: "kill",
                    value: "kill"
                },
                {
                    name: "meme",
                    value: "meme"
                },
                {
                    name: "cat",
                    value: "cat"
                },
                {
                    name: "dog",
                    value: "dog"
                },
                {
                    name: "embed",
                    value: "embed"
                },
                {
                    name: "motivate",
                    value: "motivate"
                },
                {
                    name: "about",
                    value: "about"
                }
            ]
        }
    ],

    callback: (interaction) => {
        const command = interaction.options.getString("command");
        const fun = "ea, helloworld, idiot, kill, meme";
		const other = "cat, dog, embed, motivate";
		const info = "about";
        let embed = new MessageEmbed()
            .setColor("RANDOM")
        
        if (command == "ea") {
            embed.setTitle("ea")
			embed.addFields({ name: "Description", value: "This command will tell a joke about EA being money hungry." })
        } else if (command == "helloworld") {
            embed.setTitle("helloworld")
			embed.addFields({ name: "Description", value: "This command is self explanatory." })
        } else if (command == "idiot") {
            embed.setTitle("idiot")
			embed.addFields(
				{ name: "Description", value: "This command will call someone ~~a sussy baka~~ an idiot." },
				{ name: "Usage", value: "e!idiot @member" }
			)
        } else if (command == "kill") {
            embed.setTitle("kill")
			embed.addFields(
				{ name: "Description", value: "This command will ~~kill~~ send recipes to kill someone." },
				{ name: "Usage", value: "e!kill @member" }
			)
        } else if (command == "meme") {
            embed.setTitle("meme")
			embed.addFields({ name: "Description", value: "This command will send ~~JOE MAMA!!!~~ a funny meme." })
        } else if (command == "cat") {
            embed.setTitle("cat")
			embed.addFields({ name: "Description", value: "This command will send a picture of an adorable cat :D" })
        } else if (command == "dog") {
            embed.setTitle("dog")
			embed.addFields({ name: "Description", value: "This command will send a picture of an adorable dog :D" })
        } else if (command == "embed") {
            embed.setTitle("embed")
			embed.addFields({ name: "Description", value: "This command will send your message in a fancy embed." })
        } else if (command == "motivate") {
            embed.setTitle("motivate")
			embed.addFields({ name: "Description", value: "This command will motivate you to do wonderful things :)" })
        } else if (command == "about") {
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
        }
        interaction.reply({ embeds: [embed] });
    }
};
