const { MessageEmbed } = require("discord.js");
const { owner, admin, tester } = require("../../../config.json");
const { client } = require("../../../index");

module.exports = {
    callback: (message) => {
        if (!message.mentions.members.size) {
            const embed = new MessageEmbed()
            .setTitle("Ping someone!")
            .setColor("RED")
            return message.channel.send({ embeds: [embed] })
        }

        let embed = new MessageEmbed()
            .setColor("RANDOM")

        const mentionedUserId = message.mentions.members.first().id;
        const clientId = client.user.id;
        const authorId = message.author.id;
        const mentionedUserName = message.mentions.members.first().displayName;

        if (clientId.includes(mentionedUserId)) {
            embed.setTitle("Idiot, you do know that I am emotionless?")
            embed.setColor("RED")
        } else if (authorId.includes(mentionedUserId)) {
		    embed.setTitle("You are even more idiotic for calling yourself an idiot.")
        } else if (owner.includes(mentionedUserId)) {
		    embed.setTitle("Serge is an idiot. (he deserved it)")
        } else if (admin.includes(mentionedUserId)) {
		    embed.setTitle(`${mentionedUserName} is not an idiot!`)
            embed.setColor("RED")
        } else if (tester.includes(mentionedUserId)) {
            embed.setTitle(`${mentionedUserName} is not an idiot! What did that fellow tester do to you?`)
            embed.setColor("RED")
        } else {
		    embed.setTitle(`${mentionedUserName} is an idiot.`)
        }
        return message.channel.send({ embeds: [embed] });
    }
};
