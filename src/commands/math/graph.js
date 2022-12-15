const {
  EmbedBuilder, ModalBuilder, SlashCommandBuilder,
  ActionRowBuilder, TextInputBuilder
} = require("discord.js");
const { getColor } = require("../../utils/misc");

module.exports = class Graph {
  constructor() {
    this.data = new SlashCommandBuilder()
      .setName("graph")
      .setDescription("Displays a graph of a function.")
      .addStringOption(string => string
        .setName("type")
        .setDescription("Select the type of the graph.")
        .addChoices(
          { name: "Linear", value: "linear" },
          { name: "Parabola", value: "parabola" },
          { name: "Cubic parabola", value: "cubicParabola" },
          { name: "Hyperbola", value: "hyperbola" }
        )
        .setRequired(true)
      );
  }

  async run(interaction) {
    let modal = new ModalBuilder()
      .setTitle("Input numbers")
      .setCustomId("modal");

    let embed = new EmbedBuilder()
      .setColor(getColor(200));

    if (type === "linear") {        
      const inputM = new TextInputBuilder()
        .setLabel("Input m")
        .setStyle("Short")
        .setCustomId("m")
        .setRequired(true);

      const actionRow = new ActionRowBuilder().addComponents(inputM);
      modal.addComponents(actionRow);

      await interaction.showModal(modal);
    }
  }
}
