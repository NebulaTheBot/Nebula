import { SlashCommandSubcommandBuilder, EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { genColor } from "../../utils/colorGen.js";

export default class Donate {
  data: SlashCommandSubcommandBuilder;
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("donate")
      .setDescription("Helps us keep up Nebula!");
  }

  async run(interaction: ChatInputCommandInteraction) {
    const donationEmbed = new EmbedBuilder()
      .setTitle("Donate")
      .setDescription([
        "Thanks for being interested into donating for Nebula.",
        "We'll be grateful for any donation and use it towards paying our server costs and software costs.",
        "[Click here](https://nebula.fyreblitz.com/) to donate via PayPal!"
      ].join("\n"))
      .setFields({
        name: "🤔 • Why should I donate?",
        value: [
          "By donating, you help the Nebula team to continue existing and keep production going as well as keeping our servers alive - Nebula is completely free and, as of now, doesn't have any other way to have upkeep or funding, and donating is a great way to help us.",
          "If you donated, you can reach out to us to request a special donators role to flex to your friends.",
          "Additionally, you're helping us keep up the servers and make more amazing features :)."
        ].join("\n\n")
      })
      .setThumbnail(interaction.client.user.avatarURL())
      .setColor(genColor(270));

    await interaction.followUp({ embeds: [donationEmbed] });
  }
}
