const { MessageEmbed, Constants } = require("discord.js");

module.exports = {
    name: "embed",
    description: "This command will send your message in a fancy embed.",
    options: [
        {
            name: "message",
            description: "The content of an embed.",
            required: true,
            type: Constants.ApplicationCommandOptionTypes.STRING
        }
    ],

    callback: (interaction) => {
        const message = interaction.options.getString("message");
        const embed = new MessageEmbed()
            .setTitle(`${message}`)
            .setColor("RANDOM")
        
        const embed1 = new MessageEmbed()
            .setTitle("You have sent a message.")
            .setColor("RANDOM")
        
        interaction.reply({ embeds: [embed1], ephemeral: true });
        interaction.channel.send({ embeds: [embed] });
    } 
};
