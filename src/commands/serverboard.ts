import {
  SlashCommandSubcommandBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  ButtonInteraction,
  type Guild,
  type ChatInputCommandInteraction,
  ComponentType,
} from "discord.js";
import { quickSort } from "../utils/quickSort";
import { serverEmbed } from "../utils/embeds/serverEmbed";
import { listPublicServers } from "../utils/database/settings";
import { errorEmbed } from "../utils/embeds/errorEmbed";

export default class Serverboard {
  data: SlashCommandSubcommandBuilder;
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("serverboard")
      .setDescription("Shows the servers that have Nebula.")
      .addNumberOption((option) =>
        option.setName("page").setDescription("The page you want to see."),
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    const guildsMapped: Record<string, Guild> = {};
    for (const shownGuild of listPublicServers()) {
      const guild = interaction.client.guilds.cache.find(
        (guild) => (guild.id = shownGuild + ""),
      )!;
      guildsMapped[`${guild.memberCount}:${guild.id}`] = guild;
    }

    if (Object.keys(guildsMapped).length == 0)
      return interaction.reply({
        embeds: [errorEmbed("No public server found")],
      });

    const guildsSorted = quickSort(
      [...Object.keys(guildsMapped).map((i) => Number(i.split(":")[0]))],
      [[...Object.values(guildsMapped)]],
      0,
      Object.keys(guildsMapped).length - 1,
    )[1]![0].reverse();

    const pages = guildsSorted.length;
    const argPage = interaction.options.getNumber("page", false)!;
    let page =
      (argPage - 1 <= 0 ? 0 : argPage - 1 > pages ? pages - 1 : argPage - 1) ||
      0;
    let guild = guildsSorted[page];
    let embed = await serverEmbed({
      guild,
      page: page + 1,
      pages,
      showInvite: true,
    });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("left")
        .setEmoji("1137330341472915526")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("right")
        .setEmoji("1137330125004869702")
        .setStyle(ButtonStyle.Primary),
    );

    const reply = await interaction.reply({
      embeds: [embed],
      components: [row],
    });
    reply.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 60000,
      })
      .on("collect", async (i: ButtonInteraction) => {
        switch (i.customId) {
          case "left":
            page--;
            if (page < 0) page = pages - 1;
          case "right":
            page++;
            if (page >= pages) page = 0;
        }

        guild = guild;
        embed = embed;

        await interaction.editReply({ embeds: [embed], components: [row] });
      });
  }
}
