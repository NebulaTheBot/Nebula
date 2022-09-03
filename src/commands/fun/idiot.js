const { EmbedBuilder, ApplicationCommandOptionType  } = require("discord.js");
const { OWNER, ADMIN, TESTER } = require("../../config.json");
const { client } = require("../../index");

module.exports = {
  name: "idiot",
  description: "Calls someone ~~a sussy baka~~ an idiot.",
  options: [{
    name: "user",
    description: "The user that you want to call an idiot.",
    required: true,
    type: ApplicationCommandOptionType.User
  }],

  callback: interaction => {
    const user = interaction.options.getUser("user");
    let embed = new EmbedBuilder()
      .setColor("Blue");
      
    const clientId = client.user.id;
    const authorId = interaction.user.id;
      
    if (clientId.includes(user.id)) embed
      .setTitle("Idiot, you do know that I am emotionless?")
      .setColor("Red");
    
    else if (authorId.includes(user.id)) embed.setTitle("You are even more idiotic for calling yourself an idiot.");
    
    else if (OWNER.includes(user.id)) return;
    
    else if (ADMIN.includes(user.id)) embed
      .setTitle(`${user.username} is not an idiot!`)
      .setColor("Red");

    else if (TESTER.includes(user.id)) embed
      .setTitle(`${user.username} is not an idiot! What did that fellow tester do to you?`)
      .setColor("Red");

    else embed.setTitle(`${user.username} is an idiot.`);

    interaction.reply({ embeds: [embed] });
  }
}
