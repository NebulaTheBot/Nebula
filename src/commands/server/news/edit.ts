import {
  SlashCommandSubcommandBuilder, EmbedBuilder, PermissionsBitField,
  ModalBuilder, TextInputBuilder, ActionRowBuilder,
  TextInputStyle, TextChannel, Message,
  type ChatInputCommandInteraction
} from "discord.js";
import { getNewsTable } from "../../../utils/database.js";
import { genColor } from "../../../utils/colorGen.js";
import { errorEmbed } from "../../../utils/embeds/errorEmbed.js";
import { sendSubscribedNews, News } from "../../../utils/sendSubscribedNews.js";
import { QuickDB } from "quick.db";

export default class Edit {
  data: SlashCommandSubcommandBuilder;
  deferred: boolean = false;
  db: QuickDB<any>;

  constructor(db?: QuickDB<any>) {
    this.db = db;
    this.data = new SlashCommandSubcommandBuilder()
      .setName("edit")
      .setDescription("Edits new of your guild.")
      .addStringOption(option => option
        .setName("id")
        .setDescription("The ID of the news you want to edit.")
        .setRequired(true)
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    const db = this.db;
    const newsTable = await getNewsTable(db);

    const user = interaction.user;
    const guild = interaction.guild;
    const id = interaction.options.getString("id", true).trim();
    const news = await newsTable
      ?.get(`${guild.id}.news.${id}`)
      .then(news => news as News)
      .catch(() => null as News | null);

    if (!news) return await interaction.followUp({
      embeds: [errorEmbed("The specified news doesn't exist.")]
    });

    const author = user.displayName ?? user.username;
    const timestamp = Date.now().toString();
    const member = guild.members.cache.get(user.id);

    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild))  return await interaction.followUp({
      embeds: [errorEmbed("You need **Manage Server** permissions to add news.")],
    });

    const editModal = new ModalBuilder()
      .setCustomId("editnews")
      .setTitle("Edit News: " + news.title);

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

    const firstActionRow = new ActionRowBuilder().addComponents(titleInput) as ActionRowBuilder<TextInputBuilder>;
    const secondActionRow = new ActionRowBuilder().addComponents(bodyInput) as ActionRowBuilder<TextInputBuilder>;
    const thirdActionRow = new ActionRowBuilder().addComponents(imageURLInput) as ActionRowBuilder<TextInputBuilder>;

    editModal.addComponents(firstActionRow, secondActionRow, thirdActionRow);
    await interaction.showModal(editModal).catch(err => console.error(err));

    interaction.client.once("interactionCreate", async (interaction) => {
      if (!interaction.isModalSubmit()) return;
      if (interaction.customId !== "editnews") return;

      const title = interaction.fields.getTextInputValue("title") as string;
      const body = interaction.fields.getTextInputValue("body") as string;
      const imageURL = interaction.fields.getTextInputValue("imageurl") as string | undefined;

      if (imageURL) await interaction.reply({
        embeds: [errorEmbed("The image URL you provided is invalid.")],
      });

      const newNews = {
        ...news,
        title,
        body,
        imageURL,
        author,
        authorPfp: user.avatarURL(),
        updatedAt: timestamp
      };

      sendSubscribedNews(guild, {...newNews, title: `Updated: ${newNews.title}`} as News)
        .catch(err => console.error(err));

      const newsEmbed = new EmbedBuilder()
        .setAuthor({ name: newNews.author, iconURL: newNews.authorPfp ?? null })
        .setTitle(newNews.title)
        .setDescription(newNews.body)
        .setImage(newNews.imageURL || null)
        .setTimestamp(parseInt(newNews.updatedAt))
        .setFooter({ text: `Updated news from ${guild.name}` })
        .setColor(genColor(200));

      const subscribedNewsChannel = await newsTable
        ?.get(`${guild.id}.channel`)
        .then(channel => channel as { channelId: string; roleId: string } | null)
        .catch(() => {
          return { channelId: null as string | null, roleId: null as string | null };
        });

      if (subscribedNewsChannel.channelId) {
        const messageId = newNews?.messageId;
        const newsChannel = (await guild.channels.fetch(subscribedNewsChannel?.channelId ?? "").catch(() => { })) as TextChannel | null;

        if (!messageId && newsChannel.id) newNews.messageId = ((await newsChannel
          ?.send({
            embeds: [newsEmbed],
            content: subscribedNewsChannel.roleId ? `<@&${subscribedNewsChannel.roleId}>` : null
          })
          .catch(() => { })) as Message<any> | null
        )?.id;

        else if (newsChannel.id) await newsChannel?.messages
          .edit(messageId, {
            embeds: [newsEmbed],
            content: subscribedNewsChannel.roleId ? `<@&${subscribedNewsChannel.roleId}>` : null
          })
          .catch(() => { });
      }

      const embed = new EmbedBuilder()
        .setTitle("✅ • News edited!")
        .setColor(genColor(100));

      await newsTable.set(`${guild.id}.news.${id}`, newNews);
      await interaction.reply({ embeds: [embed] });
    });
  }
}
