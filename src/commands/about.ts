import { SlashCommandSubcommandBuilder, EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { genColor } from "../utils/colorGen";
import { randomise } from "../utils/randomise";

export default class About {
  data: SlashCommandSubcommandBuilder;
  deferred: boolean = false;

  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("about")
      .setDescription("Shows information about the bot.");
  }

  async run(interaction: ChatInputCommandInteraction) {
    const client = interaction.client;
    const guilds = client.guilds.cache;
    const shards = client.shard?.count;
    const hearts = ["💖", "💝", "💓", "💗", "💘", "💟", "💕", "💞"];

    const embed = new EmbedBuilder()
      .setAuthor({ name: "•  About", iconURL: client.user.displayAvatarURL() })
      .setDescription("Nebula is a multiplatform, multipurpose bot with the ability to add extensions to have additional features.")
      .setFields(
        {
          name: "📃 • General",
          value: [
            "**Version** 0.1",
            `**${guilds.size}** guild${guilds.size === 1 ? "" : "s"} • **${shards}** shard${shards === 1 ? "" : "s"}`
          ].join("\n")
        },
        {
          name: "🌌 • Entities involved",
          value: [
            "**Head developer**: Goos",
            "**Developers**: Golem64, Pigpot, ThatBOI",
            "**Designers**: ArtyH, Optix, proJM, Slider_on_the_black",
            "**Translators**: Dimkauzh, Golem64, Optix, Sungi, SaFire, ThatBOI",
            "And **YOU**, for using Nebula."
          ].join("\n")
        },
        {
          name: "🔗 • Links",
          value: "[GitHub](https://www.github.com/NebulaTheBot)・[YouTube](https://www.youtube.com/@NebulaTheBot)・[Instagram](https://instagram.com/NebulaTheBot)・[Mastodon](https://mastodon.online/@NebulaTheBot@mastodon.social)・[Guilded](https://guilded.gg/Nebula)・[Revolt](https://rvlt.gg/28TS9aXy)"
        }
      )
      .setFooter({ text: `Made by the Nebula team with ${randomise(hearts)}` })
      .setThumbnail(client.user.displayAvatarURL())
      .setColor(genColor(270));

    await interaction.reply({ embeds: [embed] });
  }
}
