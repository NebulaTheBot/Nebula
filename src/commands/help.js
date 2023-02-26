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
        { name: "🔉 • Echo", value: "Send messages and embeds." },
        { name: "❔ • Info", value: "Get information about the server and its members." },
        { name: "📊 • Manage", value: "Manage your server." }
      )
      .setColor(getColor(200));

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
