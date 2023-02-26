const { EmbedBuilder, SlashCommandSubcommandBuilder } = require("discord.js");
const { getColor } = require("../../utils/misc");

module.exports = class Donate {
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("donate")
      .setDescription("Donate money to the Nebula team.");
  }

  run(interaction) {
    const client = interaction.client;

    const embed = new EmbedBuilder()
      .setTitle("🙏 • Thanks for considering to donate!")
      .setDescription([
        "The Nebula team will use this money for hosting the website and the bot.",
        "We use [PayPal](https://www.paypal.com/uk/home) for donations."
      ].join("\n\n"))
      .addFields({
        name: "🤔 • Why should I donate?",
        value: [
          "By donating, you help the Nebula team exist. The Nebula project is completely free and open source, and donating is a great way to help us.",
          "If you connect your PayPal account with Discord, you can get a Donator role and access to donator-only channels in our Discord."
        ].join("\n\n")
      })
      .setThumbnail(client.user.displayAvatarURL())
      .setColor(getColor(200));

    interaction.editReply({ embeds: [embed] });
  }
}
