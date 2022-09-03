const { MessageEmbed, Constants } = require("discord.js");
const { owner, admin, tester } = require("../../../config.json");
const { client } = require("../../../index");

module.exports = {
    name: "idiot",
    description: "This command will call someone ~~a sussy baka~~ an idiot.",
    options: [
        {
            name: "user",
            description: "The user that you want to call an idiot.",
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
            embed.setTitle("Idiot, you do know that I am emotionless?")
            embed.setColor("RED")
        } else if (authorId.includes(user.id)) {
            embed.setTitle("You are even more idiotic for calling yourself an idiot.")
        }  else if (owner.includes(user.id)) {
            embed.setTitle("Serge is an idiot. (he deserved it)")
        } else if (admin.includes(user.id)) {
            embed.setTitle(`${user.username} is not an idiot!`)
            embed.setColor("RED")
        } else if (tester.includes(user.id)) {
            embed.setTitle(`${user.username} is not an idiot! What did that fellow tester do to you?`)
            embed.setColor("RED")
        } else {
            embed.setTitle(`${user.username} is an idiot.`)
        }
        interaction.reply({ embeds: [embed] });
    }
};
