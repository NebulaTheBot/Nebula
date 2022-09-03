const { MessageEmbed } = require("discord.js");
const getFiles = require("./getFiles");
const cfg = require("../config.json");

module.exports = (client) => {
    const path = "C:\\Users\\Сергей\\Desktop\\Projects\\Entity\\Entity.js\\Entity TB\\commands";    
    const commands = [];
    const commandFiles = getFiles(`${path}\\normal`, ".js");
    
    for (const command of commandFiles) {
        let commandFile = require(command);
        if (commandFile.default) commandFile = commandFile.default;
        
        const split = command.replace(/\\/g, "/").split("/");
        const commandName = split[split.length -1].replace(".js", "");
        commands[commandName.toLowerCase()] = commandFile;
    };
    
    client.on("messageCreate", (message) => {
        cfg.prefixes.forEach(prefix => {
            if (!message.content.startsWith(prefix)) return;
    
            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            try {
                commands[commandName].callback(message, ...args);
            } catch (error) {
                console.error(error);

                const embed = new MessageEmbed()
                    .setTitle("An error occured while executing that command.")
                    .setDescription("Contact goos#5672 and send the full error.")
                    .addFields({ name: "Full error", value: `${error}` })
                    .setColor("RED")
                message.channel.send({ embeds: [embed] });
            }
        })
    });

    const slashCommands = [];
    const slashCommandFiles = getFiles(`${path}\\slash`, ".js");
    const guild = client.guilds.cache.get(cfg.guilds);

    for (const slashCommand of slashCommandFiles) {
        let slashCommandFile = require(slashCommand);
        slashCommands[slashCommandFile.name.toLowerCase()] = slashCommandFile;
        slashCommands.push(slashCommandFile);
    };
    // guild.commands.set([]);
    guild.commands.set(slashCommands);
    
    client.on("interactionCreate", (interaction) => {
        if (!interaction.isCommand()) return;

        try {
            slashCommands[interaction.commandName].callback(interaction);
        } catch (error) {
            console.error(error);
    
            const embed = new MessageEmbed()
                .setTitle("An error occured while executing that command.")
                .setDescription("Contact goos#5672 and send the full error.")
                .addFields({ name: "Full error", value: `${error}` })
                .setColor("RED")
            interaction.reply({ embeds: [embed], ephemeral: true });
        }
    });  
};
