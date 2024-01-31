import {
  SlashCommandSubcommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  TextInputStyle,
  type ChatInputCommandInteraction
} from "discord.js";
import { genColor } from "../../../utils/colorGen";
import { errorEmbed } from "../../../utils/embeds/errorEmbed";
import { get, updateNews } from "../../../utils/database/news";

export default class Edit {
  data: SlashCommandSubcommandBuilder;
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("edit")
      .setDescription("Edits the news of your guild.")
      .addStringOption(option =>
        option
          .setName("id")
          .setDescription("The ID of the news you want to edit.")
          .setRequired(true)
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    if (
      !interaction
        .guild!.members.cache.get(interaction.user.id)!
        .permissions.has(PermissionsBitField.Flags.ManageGuild)
    )
      return await interaction.followUp({
        embeds: [errorEmbed("You need **Manage Server** permissions to add news.")]
      });

    const id = interaction.options.getString("id", true).trim();
    const news = get(id);
    if (!news)
      return await interaction.followUp({
        embeds: [errorEmbed("The specified news doesn't exist.")]
      });

    const editModal = new ModalBuilder()
      .setCustomId("editnews")
      .setTitle(`Edit News: ${news.title}`);

    const titleInput = new TextInputBuilder()
      .setCustomId("title")
      .setPlaceholder("Title")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(100)
      .setLabel("Title")
      .setValue(news.title)
      .setRequired(true);

    const bodyInput = new TextInputBuilder()
      .setCustomId("body")
      .setPlaceholder("Content (markdown)")
      .setMaxLength(4000)
      .setStyle(TextInputStyle.Paragraph)
      .setLabel("Content (markdown)")
      .setValue(news.body)
      .setRequired(true);

    const imageURLInput = new TextInputBuilder()
      .setCustomId("imageurl")
      .setPlaceholder("Big image URL (bottom)")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(1000)
      .setLabel("Big image URL (bottom)")
      .setValue(news.imageURL)
      .setRequired(false);

    const firstActionRow = new ActionRowBuilder().addComponents(
      titleInput
    ) as ActionRowBuilder<TextInputBuilder>;
    const secondActionRow = new ActionRowBuilder().addComponents(
      bodyInput
    ) as ActionRowBuilder<TextInputBuilder>;
    const thirdActionRow = new ActionRowBuilder().addComponents(
      imageURLInput
    ) as ActionRowBuilder<TextInputBuilder>;

    editModal.addComponents(firstActionRow, secondActionRow, thirdActionRow);
    await interaction.showModal(editModal).catch(err => console.error(err));

    interaction.client.once("interactionCreate", async interaction => {
      if (!interaction.isModalSubmit()) return;

      const imageURL = interaction.fields.getTextInputValue("imageurl");
      if (imageURL) {
        await interaction.reply({
          embeds: [errorEmbed("The image URL you provided is invalid.")]
        });
        return;
      }

      updateNews(
        id,
        interaction.fields.getTextInputValue("title"),
        interaction.fields.getTextInputValue("body"),
        imageURL
      );
      await interaction.reply({
        embeds: [new EmbedBuilder().setTitle("✅ • News edited!").setColor(genColor(100))]
      });
    });
  }
}
