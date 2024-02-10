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
import { sendChannelNews } from "../../../utils/sendChannelNews";
import { sendNews } from "../../../utils/database/news";
import { getSetting } from "../../../utils/database/settings";

export default class Send {
  data: SlashCommandSubcommandBuilder;
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("send")
      .setDescription("Send your news.");
  }

  async run(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild!;
    const member = guild.members.cache.get(interaction.user.id)!;
    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild))
      return await interaction.reply({
        embeds: [errorEmbed("You need **Manage Server** permissions to send news.")]
      });

    const newsModal = new ModalBuilder().setCustomId("sendnews").setTitle("Write your news out.");

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

    const firstActionRow = new ActionRowBuilder().addComponents(
      titleInput
    ) as ActionRowBuilder<TextInputBuilder>;
    const secondActionRow = new ActionRowBuilder().addComponents(
      bodyInput
    ) as ActionRowBuilder<TextInputBuilder>;
    const thirdActionRow = new ActionRowBuilder().addComponents(
      imageURLInput
    ) as ActionRowBuilder<TextInputBuilder>;

    newsModal.addComponents(firstActionRow, secondActionRow, thirdActionRow);
    await interaction.showModal(newsModal).catch(err => console.error(err));
    interaction.client.once("interactionCreate", async interaction => {
      if (!interaction.isModalSubmit()) return;

      const imageURL = interaction.fields.getTextInputValue("imageurl");
      if (imageURL) {
        await interaction.reply({
          embeds: [errorEmbed("The image URL you provided is invalid.")]
        });
        return;
      }

      sendChannelNews(guild, crypto.randomUUID()).catch(err => console.error(err));
      sendNews(
        guild.id,
        interaction.fields.getTextInputValue("title"),
        interaction.fields.getTextInputValue("body"),
        imageURL!,
        interaction.user.displayName,
        interaction.user.avatarURL()!,
        null!,
        getSetting(guild.id, "news.channelID")!,
        getSetting(guild.id, "news.roleID")!
      );

      await interaction.reply({
        embeds: [new EmbedBuilder().setTitle("✅ • News sent!").setColor(genColor(100))]
      });
    });
  }
}
