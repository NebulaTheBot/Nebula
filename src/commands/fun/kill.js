const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { OWNER, ADMIN, TESTER } = require("../../config.json");
const { client } = require("../../index");

module.exports = {
  name: "kill",
  description: "~~Kills~~ sends recipes to kill someone.",
  options: [{
    name: "user",
    description: "The user that you want to kill.",
    required: true,
    type: ApplicationCommandOptionType.User,
  }],

  callback: interaction => {
    const user = interaction.options.getUser("user");
    let embed = new EmbedBuilder()
      .setColor("Blue");

    const clientId = client.user.id;
    const authorId = interaction.user.id;

    if (clientId.includes(user.id)) embed
      .setTitle("Well, immortality is very good. And the ability to yeet you... is good too.")
      .setColor("Red");

    else if (authorId.includes(user.id)) {
      const messages = [
        "Never gonna let you die, \n~~Never gonna let you down~~",
        "Sorry, I don't give ideas on how to die."
      ];

      const title = messages[Math.floor(Math.random() * messages.length)];

      embed
        .setTitle(`${title}`)
        .setColor("Red");
    }

    else if (OWNER.includes(user.id)) return;
    
    else if (ADMIN.includes(user.id)) embed
      .setTitle("Uhh, an admin snapped their finger on you.")
      .setColor("Red");

    else if (TESTER.includes(user.id)) embed
      .setTitle("Tester is more powerful than you think.. **you died**")
      .setColor("Red");
      
    else {
      const messages = [
        `${user.username} stepped on a LEGO.`,
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
        `${interaction.member.nickname} told Serge to ban ${user.username}.`
      ];

      const title = messages[Math.floor(Math.random() * messages.length)];
      embed.setTitle(`${title}`);
    }
    interaction.reply({ embeds: [embed] });
  }
}
