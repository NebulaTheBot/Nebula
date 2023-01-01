const {
  EmbedBuilder, ModalBuilder, SlashCommandSubcommandBuilder,
  ActionRowBuilder, TextInputBuilder, ButtonBuilder
} = require("discord.js");
const { getColor } = require("../../utils/misc");

module.exports = class Graph {
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
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
        .setRequired(false)
      );
  }

  async run(interaction) {
    let modal = new ModalBuilder()
      .setTitle("Test modal")
      .setCustomId("modal");

    const inputM = new TextInputBuilder()
      .setLabel("Test input")
      .setStyle("Short")
      .setCustomId("m")
      .setRequired(true);

    const actionRow = new ActionRowBuilder().addComponents(inputM);
    modal.addComponents(actionRow);

    let embed = new EmbedBuilder()
      .setTitle("this is a test embed, nothing different")
      .setColor(getColor(270));

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("test")
        .setStyle("Primary")
        .setCustomId("test")
    )

    interaction.editReply({ embeds: [embed] });
    await interaction.showModal(modal);
  }
}
