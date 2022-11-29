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
          { name: "y = m*x + b", value: "linear1" },
          { name: "y = m*x", value: "linear2" },
          { name: "y = x + b", value: "linear3" },
          { name: "y = a*x^2", value: "parabola" },
          { name: "y = a*x^3", value: "cubicParabola" },
          { name: "y = k/x", value: "hyperbola" }
        )
        .setRequired(true)
      );
  }

  async run(interaction) {
    const type = interaction.options.getString("type");
    let modal = new ModalBuilder()
      .setTitle("Input numbers")
      .setCustomId("modal");

    let embed = new EmbedBuilder()
      .setColor(getColor(200));

    if (type === "linear1") {
      const inputM = new TextInputBuilder()
        .setLabel("Input m")
        .setStyle("Short")
        .setCustomId("m")
        .setValue("2")
        .setRequired(true);

      const actionRow = new ActionRowBuilder().addComponents(inputM);
      modal.addComponents(actionRow);

      await interaction.showModal(modal);
    }
  }
}
