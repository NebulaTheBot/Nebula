import {
  SlashCommandSubcommandBuilder, EmbedBuilder, ActionRowBuilder,
  ButtonBuilder, ButtonStyle, type ChatInputCommandInteraction
} from "discord.js";
import { genColor } from "../../utils/colorGen.js";
import { getNewsTable } from "../../utils/database.js";
import errorEmbed from "../../utils/embeds/errorEmbed.js";
import { QuickDB } from "quick.db";

export default class News {
  data: SlashCommandSubcommandBuilder;
  db: QuickDB<any>;

  constructor(db?: QuickDB<any>) {
    this.db = db;
    this.data = new SlashCommandSubcommandBuilder()
      .setName("news")
      .setDescription("The news of the current server you're in.")
      .addNumberOption(option => option
        .setName("page")
        .setDescription("The page of the news you want to see")
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    const db = this.db;
    const newsletterTable = await getNewsTable(db);

    const guild = interaction.guild;
    let page = interaction.options.getNumber("page") ?? 1;

    const news = await newsletterTable
      ?.get(`${guild.id}.news`)
      .then(news => news as any[] ?? [])
      .catch(() => []);

    const newsSorted = (
      Object.values(news).map((newsItem, i) => {
        return {
          id: Object.keys(news)[i],
          ...newsItem
        }
      }) as any[]
    )?.sort((a, b) => b.createdAt - a.createdAt);

    if (!news) return await interaction.followUp({
      embeds: [errorEmbed("No news found.\nAdmins can add news with the **/settings news add** command.")]
    });

    if (!newsSorted) return await interaction.followUp({
      embeds: [errorEmbed("No news found.\nAdmins can add news with the **/settings news add** command.")]
    });

    if (newsSorted.length == 0) return await interaction.followUp({
      embeds: [errorEmbed("No news found.\nAdmins can add news with the **/settings news add** command.")]
    });

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
      .setColor(genColor(200));

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

    const buttonCollector = interaction.channel.createMessageComponentCollector({
      filter: i => i.user.id === interaction.user.id,
      time: 60000
    });

    buttonCollector.on("collect", async i => {
      if (!i.isButton()) return;
      const id = i.customId;

      if (id == "left") {
        page--;
        if (page < 1) page = newsSorted.length;
      } else if (id == "right") {
        page++;
        if (page > newsSorted.length) page = 1;
      }

      currentNews = newsSorted[page - 1];
      newsEmbed = new EmbedBuilder()
        .setAuthor({ name: currentNews.author, iconURL: currentNews.authorPfp ?? null })
        .setTitle(currentNews.title)
        .setDescription(currentNews.body)
        .setImage(currentNews.imageURL || null)
        .setTimestamp(parseInt(currentNews.updatedAt))
        .setFooter({ text: `Page ${page} of ${newsSorted.length} • ID: ${currentNews.id}` })
        .setColor(genColor(200));

      await interaction.editReply({ embeds: [newsEmbed], components: [row] });
      await i.deferUpdate();
    });
  }
}
