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
        const memberName = message.member.displayName;

        if (clientId.includes(mentionedUserId)) {
            embed.setTitle("Well, immortality is very good. And the ability to yeet you... is good too.")
            embed.setColor("RED")
        } else if (authorId.includes(mentionedUserId)) {
            const messages = ["Never gonna let you die, \n~~Never gonna let you down~~",
                              "Sorry, I don't give ideas on how to die."]
            const title = messages[Math.floor(Math.random() * messages.length)]
            embed.setTitle(`${title}`)
            embed.setColor("RED")
        } else if (owner.includes(mentionedUserId)) {
            const messages = ["**Instant kill mode activated.** Let me just hunt him down..",
                              "OK, **proceeds to kill Serge**",
                              "Hey, want a joke? Serge is a joke! **kills**"]
            const title = messages[Math.floor(Math.random() * messages.length)]
            embed.setTitle(`${title}`)
        } else if (admin.includes(mentionedUserId)) {
            embed.setTitle("Uhh, an admin snapped their finger on you.")
            embed.setColor("RED")
        } else if (tester.includes(mentionedUserId)) {
            embed.setTitle("Tester is more powerful than you think.. **you died**")
            embed.setColor("RED")
        } else {
            const mentionedUserName = message.mentions.members.first().displayName;
            const messages = [`${mentionedUserName} stepped on a LEGO.`,
                              `${mentionedUserName} fell from the sky, but not long after they returned.`,
                              `${mentionedUserName} wanted to get milk but they died in a car crash.`,
                              `${mentionedUserName}'s dad got to get milk.`,
                              `${mentionedUserName} ate expired Nutella, given by ${memberName}.`,
                              `${mentionedUserName}.exe has stopped working.`,
                              `${mentionedUserName} got kidnapped.`,
                              `${mentionedUserName} slipped on a banana peel.`,
                              `${mentionedUserName} got punched into the 4th wall.`,
                              `${mentionedUserName} lost 99999999999999999999 social credit.`,
                              `${mentionedUserName}'s internet went out.`,
                              `${memberName} had told ${mentionedUserName} a your mother joke.`,
                              `${memberName} told Serge to ban ${mentionedUserName}.`];
            const title = messages[Math.floor(Math.random() * messages.length)];
            embed.setTitle(`${title}`)
        }
        return message.channel.send({ embeds: [embed] });
    }
};
