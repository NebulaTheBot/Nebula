import {
  SlashCommandSubcommandBuilder, EmbedBuilder, ActionRowBuilder,
  ButtonBuilder, ButtonStyle, type ChatInputCommandInteraction
} from "discord.js";
import { genColor } from "../utils/colorGen";
import { listAllNews } from "../utils/database/news";

export default class News {
  data: SlashCommandSubcommandBuilder;

  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("news")
      .setDescription("The news of Nebula.")
      .addNumberOption(option => option
        .setName("page")
        .setDescription("The page of the news you want to see")
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    let page = interaction.options.getNumber("page") ?? 1;
    const newsSorted = (Object.values(listAllNews("903852579837059113")) as any[])?.sort((a, b) => b.createdAt - a.createdAt);

    if (page > newsSorted.length) page = newsSorted.length;
    if (page < 1) page = 1;

    let currentNews = newsSorted[page - 1];
    let embed = new EmbedBuilder()
      .setAuthor({ name: currentNews.author, iconURL: currentNews.authorPfp ?? null })
      .setTitle(currentNews.title)
      .setDescription(currentNews.body)
      .setImage(currentNews.imageURL || null)
      .setTimestamp(parseInt(currentNews.updatedAt))
      .setFooter({ text: `Page ${page} of ${newsSorted.length} • ID: ${currentNews.id}` })
      .setColor(genColor(270));

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("left")
        .setEmoji("1137330341472915526")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("right")
        .setEmoji("1137330125004869702")
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.followUp({ embeds: [embed], components: [row] });
    interaction.channel
      ?.createMessageComponentCollector({ filter: (i: { user: { id: string; }; }) => i.user.id === interaction.user.id, time: 60000 })
      .on("collect", async (i: { isButton: () => any; customId: string; deferUpdate: () => any; }) => {
        if (!i.isButton()) return;
        if (i.customId === "left") {
          page--;
          if (page < 1) page = newsSorted.length;
        } else if (i.customId === "right") {
          page++;
          if (page > newsSorted.length) page = 1;
        }

        currentNews = currentNews;
        embed = embed;

        await interaction.editReply({ embeds: [embed], components: [row] });
        await i.deferUpdate();
      });
  }
}
