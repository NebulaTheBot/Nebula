const {
  EmbedBuilder, SlashCommandBuilder, ActionRowBuilder,
  StringSelectMenuBuilder 
} = require("discord.js");
const { getColor } = require("../utils/misc");

module.exports = class Help {
  constructor() {
    this.data = new SlashCommandBuilder()
      .setName("help")
      .setDescription("Gives information about commands.");
  }

  async run(interaction) {
    let embed = new EmbedBuilder()
      .setTitle("Help")
      .addFields(
        { name: "🔉 • Echo", value: ["embed", "message"].join(", ") },
        { name: "🎮 • Game", value: "rps" },
        { name: "❔ • Info", value: ["about", "changelog", "server", "user"].join(", ") },
        { name: "📊 • Manage", value: "*Temporarily deleted.*" },
        { name: "🧮 • Math", value: "*Work in progress.*" }
      )
      .setColor(getColor(200));

    let row1 = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setPlaceholder("Select a command to view it's details")
        .setCustomId("select")
    );
    
    let row2 = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setPlaceholder("Select a subcommand to view its details and see the usage.")
        .setCustomId("select")
    )
    let counter = 1;
    for (const embedFields of embed.data.fields) {
      row1.components[0].addOptions({ label: `${embedFields.name}`, description: `View the details of ${embedFields.name}`, value: `${counter+=1}` });
      row2.components[0].addOptions({ label: `${embedFields.value}`, description: `View the details of ${embedFields.value} and see the usage`, value: `${counter+=1}` })
    }

    interaction.editReply({ embeds: [embed], components: [row1], ephemeral: true });
    const filter = ButtonInteraction => {
      return interaction.user.id !== ButtonInteraction.user.id || interaction.user.id === ButtonInteraction.user.id;
    }
    const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 30000 });

    collector.on("end", collected => {
      const value = collected.values[0];

      const embed = new EmbedBuilder().setTitle("it works");
      interaction.editReply({ embeds: [embed], components: [row2] });
    })
  }
}
