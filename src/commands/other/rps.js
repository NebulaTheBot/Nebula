const {
  EmbedBuilder, ActionRowBuilder, ButtonBuilder,
  ButtonStyle, SelectMenuBuilder, ApplicationCommandOptionType,
} = require("discord.js");
const { client } = require("../../index");

module.exports = {
  name: "rps",
  description: "A rock-paper-scissors mini-game.",
  options: [{
    name: "item",
    description: "Select an item!",
    required: true,
    type: ApplicationCommandOptionType.String,
    choices: [
      {
        name: "rock",
        value: "rock"
      },
      {
        name: "paper",
        value: "paper"
      },
      {
        name: "scissors",
        value: "scissors"
      }
    ],
  }],

  callback: interaction => {
    let embed = new EmbedBuilder()
      .setTitle(`${interaction.member.nickname} invited you to play rock-paper-scissors!`)
      .setFooter({ text: "You have 30 seconds to accept or decline." })
      .setColor("Blue");

    const cross = client.emojis.cache.get("979649982183391293");
    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("accept")
        .setLabel("✅ Accept")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("decline")
        .setEmoji(`${cross}`)
        .setLabel("Decline")
        .setStyle(ButtonStyle.Danger)
    );

    interaction.reply({ embeds: [embed], components: [buttons] });

    const filter = ButtonInteraction => {
      return interaction.user.id != ButtonInteraction.user.id || interaction.user.id == ButtonInteraction.user.id;
    }
    const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 30000 });

    collector.on("end", collection => {
      interaction.channel.bulkDelete(1, true);
      collection.forEach(click => {
        if (collection.first().customId === "decline") {
          const embed = new EmbedBuilder()
            .setTitle(`${click.member.displayName} has declined the request to play.`)
            .setColor("Red");

          message.channel.send({ embeds: [embed] });
        } else if (collection.first().customId === "accept") {
          embed
            .setTitle("Choose one of the options below!")
            .setFooter({ text: "You have 30 seconds to choose an option." });

          const list = new ActionRowBuilder().addComponents(new SelectMenuBuilder()
            .setCustomId("list")
            .setPlaceholder("Choose one of the options!")
            .addOptions([
              {
                label: "Rock",
                value: "rock",
                description: "It's about drive, it's about power",
                emoji: "🗿"
              },
              {
                label: "Paper",
                value: "paper",
                description: "idk",
                emoji: "📄"
              },
              {
                label: "Scissors",
                value: "scissors",
                description: "idk",
                emoji: "✂"
              }
            ])
          );
          click.reply({ embeds: [embed], components: [list], ephemeral: true });
    
          const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 30000 });
          collector.on("collect", collected => {
            const optionValue = interaction.options.getString("item");
            const value = collected.values[0];
              
            let embed = new MessageEmbed()
              .setTitle("You have chosen the option.")
              .setColor("Blue");

            click.editReply({ embeds: [embed], components: [] });

            if (optionValue === "rock" && value === "rock") embed.setTitle("Rock + rock = The Wok");
            else if (optionValue === "paper" && value === "paper") embed.setTitle("paper paper");
            else if (optionValue === "scissors" && value === "scissors") embed.setTitle("scissors scissors");
              
            if (
              optionValue === "rock" && value === "paper" ||
              optionValue === "paper" && value === "rock"
            ) embed.setTitle("rock paper");
            else if (
              optionValue === "rock" && value === "scissors" ||
              optionValue === "scissors" && value === "rock"
            ) embed.setTitle("rock scissors");
            else if (
              optionValue === "paper" && value === "scissors" ||
              optionValue === "scissors" && value === "paper"
            ) embed.setTitle("paper scissors");

            collected.channel.send({ embeds: [embed] });
          })
        }
      })
    })
  }
};
