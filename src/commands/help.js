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
    const embed = new EmbedBuilder()
      .setTitle("Help")
      .addFields(
        { name: "🔉 • Echo", value: "embed, message" },
        { name: "🎮 • Game", value: "rps" },
        { name: "❔ • Info", value: "about, changelog, server, user" },
        { name: "📊 • Manage", value: "*Temporarily deleted.*" },
        { name: "🧮 • Math", value: "*Work in progress.*" }
      )
      .setColor(getColor(200));

    let row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setPlaceholder("Select a command to view it's details")
        .setCustomId("select")
    );
    let counter = 1;
    for (const embedFields of embed.data.fields) {
      row.components[0].addOptions({ label: `${embedFields.name}`, value: `${counter+=1}` });
    }

    interaction.editReply({ embeds: [embed], components: [row], ephemeral: true });
  }
}
