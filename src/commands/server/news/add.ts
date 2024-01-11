import {
  SlashCommandSubcommandBuilder, EmbedBuilder, PermissionsBitField,
  ModalBuilder, TextInputBuilder, ActionRowBuilder,
  TextInputStyle, type ChatInputCommandInteraction
} from "discord.js";
import { getNewsTable } from "../../../utils/database.js";
import { genColor } from "../../../utils/colorGen.js";
import { errorEmbed } from "../../../utils/embeds/errorEmbed.js";
import { sendSubscribedNews, News } from "../../../utils/sendSubscribedNews.js";
import { sendChannelNews } from "../../../utils/sendChannelNews.js";
import { QuickDB } from "quick.db";

export default class Add {
  data: SlashCommandSubcommandBuilder;
  deferred: boolean = false;
  db: QuickDB<any>;

  constructor(db?: QuickDB<any>) {
    this.db = db;
    this.data = new SlashCommandSubcommandBuilder()
      .setName("add")
      .setDescription("Adds news to your guild.");
  }

  async run(interaction: ChatInputCommandInteraction) {
    const member = interaction.guild.members.cache.get(interaction.user.id);
    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild)) return await interaction.reply({
      embeds: [errorEmbed("You need **Manage Server** permissions to add news.")],
    });

    const newsModal = new ModalBuilder()
      .setCustomId("addnews")
      .setTitle("Create new News for your server/project");

    const titleInput = new TextInputBuilder()
      .setCustomId("title")
      .setPlaceholder("Write a title")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(100)
      .setLabel("Title")
      .setRequired(true);

    const bodyInput = new TextInputBuilder()
      .setCustomId("body")
      .setPlaceholder("Insert your content here")
      .setMaxLength(4000)
      .setStyle(TextInputStyle.Paragraph)
      .setLabel("Content (supports Markdown)")
      .setRequired(true);

    const imageURLInput = new TextInputBuilder()
      .setCustomId("imageurl")
      .setPlaceholder("Place a link to your image")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(1000)
      .setLabel("Image URL (placed at the bottom)")
      .setRequired(false);

    const firstActionRow = new ActionRowBuilder().addComponents(titleInput) as ActionRowBuilder<TextInputBuilder>;
    const secondActionRow = new ActionRowBuilder().addComponents(bodyInput) as ActionRowBuilder<TextInputBuilder>;
    const thirdActionRow = new ActionRowBuilder().addComponents(imageURLInput) as ActionRowBuilder<TextInputBuilder>;

    newsModal.addComponents(firstActionRow, secondActionRow, thirdActionRow);
    await interaction.showModal(newsModal).catch(err => console.error(err));

    interaction.client.once("interactionCreate", async interaction => {
      if (!interaction.isModalSubmit()) return;
      if (interaction.customId !== "addnews") return;

      const imageURL = interaction.fields.getTextInputValue("imageurl") as string | undefined;
      if (imageURL) {
        await interaction.reply({
          embeds: [errorEmbed("The image URL you provided is invalid.")],
        });
        return;
      }

      const id = crypto.randomUUID();
      const news = {
        id,
        title: interaction.fields.getTextInputValue("title") as string,
        body: interaction.fields.getTextInputValue("body") as string,
        imageURL,
        author: interaction.user.displayName ?? interaction.user.username,
        authorPfp: interaction.user.avatarURL(),
        createdAt: Date.now().toString(),
        updatedAt: Date.now().toString(),
        messageId: null
      };

      sendSubscribedNews(interaction.guild, news as News).catch(err => console.error(err));
      sendChannelNews(interaction.guild, news as News, id).catch(err => console.error(err));

      const embed = new EmbedBuilder()
        .setTitle("✅ • News sent!")
        .setColor(genColor(100));

      await (await getNewsTable(this.db)).set(`${interaction.guild.id}.news.${id}`, news);
      await interaction.reply({ embeds: [embed] });
    });
  }
}
