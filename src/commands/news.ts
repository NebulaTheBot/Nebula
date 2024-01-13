import {
  SlashCommandSubcommandBuilder, EmbedBuilder, ActionRowBuilder,
  ButtonBuilder, ButtonStyle, type ChatInputCommandInteraction
} from "discord.js";
import { genColor } from "../utils/colorGen";
import { getNewsTable } from "../utils/database.js";
import { QuickDB } from "quick.db";

export default class News {
  data: SlashCommandSubcommandBuilder;
  db: QuickDB<any>;

  constructor(db?: QuickDB<any>) {
    this.db = db;
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
    const news = await (await getNewsTable(this.db))
      .get(`903852579837059113.news`) // News of the Nebula server
      .then(news => news as any[] ?? [])
      .catch(() => []);

    const newsSorted = (Object.values(news) as any[])?.sort((a, b) => b.createdAt - a.createdAt);
    if (page > newsSorted.length) page = newsSorted.length;
    if (page < 1) page = 1;

    let currentNews = newsSorted[page - 1];
    let newsEmbed = new EmbedBuilder()
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

    await interaction.followUp({ embeds: [newsEmbed], components: [row] });
    interaction.channel
      .createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 60000 })
      .on("collect", async i => {
      if (!i.isButton()) return;

      if (i.customId === "left") {
        page--;
        if (page < 1) page = newsSorted.length;
      } else if (i.customId === "right") {
        page++;
        if (page > newsSorted.length) page = 1;
      }

      currentNews = currentNews;
      newsEmbed = newsEmbed;

      await interaction.editReply({ embeds: [newsEmbed], components: [row] });
      await i.deferUpdate();
    });
  }
}
