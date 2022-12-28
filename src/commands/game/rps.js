const {
  EmbedBuilder, ActionRowBuilder, ButtonBuilder,
  SelectMenuBuilder, SlashCommandSubcommandBuilder
} = require("discord.js");
const { getColor } = require("../../utils/misc");

module.exports = class Rps {
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("rps")
      .setDescription("A rock-paper-scissors mini-game.")
      .addStringOption(string => string
        .setName("item")
        .setDescription("Select an item.")
        .setRequired(true)
        .addChoices(
          { name: "rock", value: "rock" },
          { name: "paper", value: "paper" },
          { name: "scissors", value: "scissors" }
        )
      );
  }

  run(interaction) {
    let embed = new EmbedBuilder()
      .setTitle(`${interaction.member.nickname} invited you to play rock-paper-scissors!`)
      .setFooter({ text: "You have 30 seconds to accept or decline." })
      .setColor(getColor(270));

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("accept")
        .setLabel("✅ Accept")
        .setStyle("Primary"),
      new ButtonBuilder()
        .setCustomId("decline")
        .setLabel("❌ Decline")
        .setStyle("Danger")
    );

    interaction.editReply({ embeds: [embed], components: [buttons] });

    const filter = ButtonInteraction => {
      return interaction.user.id !== ButtonInteraction.user.id || interaction.user.id === ButtonInteraction.user.id;
    }
    const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 30000 });

    collector.on("collect", collection => {
      interaction.channel.bulkDelete(1, true);
      collection.forEach(click => {
        if (collection.first().customId === "decline") {
          const embed = new EmbedBuilder()
            .setTitle(`${click.member.displayName} has declined the request to play.`)
            .setColor(getColor(0));

          message.channel.send({ embeds: [embed] });
        } else if (collection.first().customId === "accept") {
          embed
            .setTitle("Choose one of the options below!")
            .setFooter({ text: "You have 30 seconds to choose an option." });

          const list = new ActionRowBuilder().addComponents(
            new SelectMenuBuilder()
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
    
          collector.on("end", collected => {
            const optionValue = interaction.options.getString("item");
            const value = collected.values[0];
              
            let embed = new EmbedBuilder()
              .setTitle("You have chosen the option.")
              .setColor(getColor(100));

            click.editReply({ embeds: [embed], components: [] });

            if (optionValue === "rock" && value === "rock") embed.setTitle("Rock + rock = The Wok");
            else if (optionValue === "paper" && value === "paper") embed.setTitle("paper paper");
            else if (optionValue === "scissors" && value === "scissors") embed.setTitle("scissors scissors");
              
            if (
              optionValue === "rock" && value === "paper" ||
              optionValue === "paper" && value === "rock"
            ) embed.setTitle([
              "Rock vs. Paper, our battle will be legendar-",
              "Oops, nvm, paper won."
            ].join("\n"));
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
