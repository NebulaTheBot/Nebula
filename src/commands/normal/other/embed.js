const { MessageEmbed } = require("discord.js");

module.exports = {
    callback: (message, ...args) => {
        const argsToString = args.join(' ');
        let embed = new MessageEmbed()

        if (argsToString != null) {
            embed.setTitle(`${argsToString}`)
            embed.setColor("RANDOM")
        }

        if (embed.title == "") {
            embed.setTitle("Specify the title!")
            embed.setColor("RED")
        }
        message.channel.send({ embeds: [embed] })
        return message.delete()
    }
};
