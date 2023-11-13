import { SlashCommandSubcommandBuilder, EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { genColor } from "../../utils/colorGen.js";
import randomise from "../../utils/randomise.js";

export default class About {
  data: SlashCommandSubcommandBuilder;
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("apply")
      .setDescription("Apply as a team member in Nebula!");
  }

  async run(interaction: ChatInputCommandInteraction) {
    const client = interaction.client;
    const hearts = ["💖", "💝", "💓", "💗", "💘", "💟", "💕", "💞", "❣️", "❤️‍🔥"];

    const applyEmbed = new EmbedBuilder()
      .setAuthor({ name: `•  Apply for team!`, iconURL: client.user.displayAvatarURL() })
      .setDescription("We're currently looking for people that could extend our team to help us make Nebula faster and better!")
      .setFields(
        {
          name: "👥 • Who we're looking for",
          value: [
            "- **Developers**: Code and implement our back-end in [TypeScript](https://www.typescriptlang.org/).",
            "- **Front-End Devs**: Make great experiences for our users by making the designs interactive using [Svelte](https://svelte.dev/).",
            "- **UI/UX/Icon designers**: Help us make Nebula not only work great, but also look great."
          ].join("\n")
        },
        {
          name: "❓ • How to apply",
          value: [
            "Join our [team applicants server](https://discord.gg/5hkHwGCbju) to find information on applying, resources + getting interviewed at.",
            `Thank you for your interest at joining Nebula, we appreciate it ${randomise(hearts)}`
          ].join("\n\n")
        }
      )
      .setFooter({ text: `Made by the Nebula team with ${randomise(hearts)}` })
      .setThumbnail(client.user.displayAvatarURL())
      .setColor(genColor(270));

    await interaction.followUp({ embeds: [applyEmbed] });
  }
}
