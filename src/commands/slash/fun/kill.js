const { MessageEmbed, Constants } = require("discord.js");
const { owner, admin, tester } = require("../../../config.json");
const { client } = require("../../../index");

module.exports = {
    name: "kill",
    description: "This command will ~~kill~~ send recipes to kill someone.",
    options: [
        {
            name: "user",
            description: "The user that you want to kill.",
            required: true,
            type: Constants.ApplicationCommandOptionTypes.USER
        }
    ],

    callback: (interaction) => {
        const user = interaction.options.getUser("user");
        let embed = new MessageEmbed()
            .setColor("RANDOM")

        const clientId = client.user.id;
        const authorId = interaction.user.id;

        if (clientId.includes(user.id)) {
            embed.setTitle("Well, immortality is very good. And the ability to yeet you... is good too.")
            embed.setColor("RED")
        } else if (authorId.includes(user.id)) {
            const messages = ["Never gonna let you die, \n~~Never gonna let you down~~",
                              "Sorry, I don't give ideas on how to die."]
            const title = messages[Math.floor(Math.random() * messages.length)]
            embed.setTitle(`${title}`)
            embed.setColor("RED")
        } else if (owner.includes(user.id)) {
            const messages = ["**Instant kill mode activated.** Let me just hunt him down..",
                              "OK, **proceeds to kill Serge**",
                              "Hey, want a joke? Serge is a joke! **kills**"]
            const title = messages[Math.floor(Math.random() * messages.length)]
            embed.setTitle(`${title}`)
        } else if (admin.includes(user.id)) {
            embed.setTitle("Uhh, an admin snapped their finger on you.")
            embed.setColor("RED")
        } else if (tester.includes(user.id)) {
            embed.setTitle("Tester is more powerful than you think.. **you died**")
            embed.setColor("RED")
        } else {
            const messages = [`${user.username} stepped on a LEGO.`,
                              `${user.username} fell from the sky, but not long after they returned.`,
                              `${user.username} wanted to get milk but they died in a car crash.`,
                              `${user.username}'s dad got to get milk.`,
                              `${user.username} ate expired Nutella, given by ${interaction.member.nickname}.`,
                              `${user.username}.exe has stopped working.`,
                              `${user.username} got kidnapped.`,
                              `${user.username} slipped on a banana peel.`,
                              `${user.username} got punched into the 4th wall.`,
                              `${user.username} lost 99999999999999999999 social credit.`,
                              `${user.username}'s internet went out.`,
                              `${interaction.member.nickname} had told ${user.username} a your mother joke.`,
                              `${interaction.member.nickname} told Serge to ban ${user.username}.`];
            const title = messages[Math.floor(Math.random() * messages.length)];
            embed.setTitle(`${title}`)
        }
        interaction.reply({ embeds: [embed] })
    }
};
