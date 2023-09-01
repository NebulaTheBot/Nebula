import {
  SlashCommandSubcommandBuilder, EmbedBuilder, PermissionsBitField,
  type ChatInputCommandInteraction, ModalBuilder, TextInputBuilder,
  ActionRowBuilder, TextInputStyle
} from "discord.js";
import { getNewsTable } from "../../../utils/database.js";
import { genColor } from "../../../utils/colorGen.js";
import { v4 as uuidv4 } from "uuid";
import errorEmbed from "../../../utils/embeds/errorEmbed.js";
import sendSubscribedNews, { News } from "../../../utils/sendSubscribedNews.js";
import sendChannelNews from "../../../utils/sendChannelNews.js";
import validateURL from "../../../utils/validateURL.js";
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
    const db = this.db;
    const newsTable = await getNewsTable(db);

    const user = interaction.user;
    const guild = interaction.guild;

    const author = user.displayName ?? user.username;
    const timestamp = Date.now().toString();
    const member = guild.members.cache.get(user.id);

    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return await interaction.reply({
        embeds: [errorEmbed("You need **Manage Server** permissions to add news.")],
      });
    }

    const newsModal = new ModalBuilder()
      .setCustomId("addnews")
      .setTitle("Create new News for your server/project");

    const titleInput = new TextInputBuilder()
      .setCustomId("title")
      .setPlaceholder("Title")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(100)
      .setLabel("Title")
      .setRequired(true);

    const bodyInput = new TextInputBuilder()
      .setCustomId("body")
      .setPlaceholder("Content (markdown)")
      .setMaxLength(4000)
      .setStyle(TextInputStyle.Paragraph)
      .setLabel("Content (markdown)")
      .setRequired(true);

    const imageURLInput = new TextInputBuilder()
      .setCustomId("imageurl")
      .setPlaceholder("Big image URL (bottom)")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(1000)
      .setLabel("Big image URL (bottom)")
      .setRequired(false);

    const firstActionRow = new ActionRowBuilder().addComponents(titleInput) as ActionRowBuilder<TextInputBuilder>;
    const secondActionRow = new ActionRowBuilder().addComponents(bodyInput) as ActionRowBuilder<TextInputBuilder>;
    const thirdActionRow = new ActionRowBuilder().addComponents(imageURLInput) as ActionRowBuilder<TextInputBuilder>;

    newsModal.addComponents(firstActionRow, secondActionRow, thirdActionRow);
    await interaction.showModal(newsModal).catch((err) => {
      console.error(err);
    });

    interaction.client.once("interactionCreate", async (interaction) => {
      if (!interaction.isModalSubmit()) return;
      if (interaction.customId !== "addnews") return;

      const title = interaction.fields.getTextInputValue("title") as string;
      const body = interaction.fields.getTextInputValue("body") as string;
      const imageURL = interaction.fields.getTextInputValue("imageurl") as string | undefined;
      let validURL = false;
      if (imageURL) validURL = validateURL(imageURL);

      if (!validURL && imageURL) {
        await interaction.reply({
          embeds: [errorEmbed("The image URL you provided is invalid.")],
        });
        return;
      }

      const id = uuidv4();
      const news = {
        id,
        title,
        body,
        imageURL,
        author,
        authorPfp: interaction.user.avatarURL(),
        createdAt: timestamp,
        updatedAt: timestamp,
        messageId: null
      };

      sendSubscribedNews(interaction.guild, news as News).catch((err) => {
        console.error(err);
      });
      sendChannelNews(interaction.guild, news as News, id).catch((err) => {
        console.error(err);
      });

      const embed = new EmbedBuilder()
        .setTitle("✅ • News sent!")
        .setColor(genColor(100));

      await newsTable.set(`${guild.id}.news.${id}`, news);
      await interaction.reply({ embeds: [embed] });
    });
  }
}
