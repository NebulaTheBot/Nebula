import {
  SlashCommandSubcommandBuilder, EmbedBuilder, PermissionsBitField,
  TextChannel, type ChatInputCommandInteraction
} from "discord.js";
import { getNewsTable } from "../../../utils/database.js";
import { genColor } from "../../../utils/colorGen.js";
import { errorEmbed } from "../../../utils/embeds/errorEmbed.js";
import { QuickDB } from "quick.db";

export default class Remove {
  data: SlashCommandSubcommandBuilder;
  db: QuickDB<any>;

  constructor(db?: QuickDB<any>) {
    this.db = db;
    this.data = new SlashCommandSubcommandBuilder()
      .setName("remove")
      .setDescription("Removes news from your guild.")
      .addStringOption(option => option
        .setName("id")
        .setDescription("The ID of the news. Found in the footer of the news.")
        .setRequired(true)
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    const db = this.db;
    const newsTable = await getNewsTable(db);
    const user = interaction.user;
    const guild = interaction.guild;
    const providedId = interaction.options.getString("id");
    const member = guild.members.cache.get(user.id);

    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild)) return await interaction.followUp({
      embeds: [errorEmbed("You need **Manage Server** permissions to delete news.")],
    });

    const embed = new EmbedBuilder()
      .setTitle("✅ • News deleted!")
      .setColor(genColor(100));

    const subscribedChannel = await newsTable
      ?.get(`${guild.id}.channel`)
      .then(channel => channel as { channelId: string, roleId: string })
      .catch(() => {
        return { channelId: null, roleId: null };
      });

    const news = await newsTable?.get(providedId).catch(() => null);
    if (!news) return await interaction.followUp({
      embeds: [errorEmbed("The specified news doesn't exist.")]
    });

    const messageId = news?.messageId;
    const newsChannel = (await interaction.guild.channels.fetch(subscribedChannel?.channelId ?? "").catch(() => null)) as TextChannel | null;
    if (newsChannel) await newsChannel?.messages.delete(messageId).catch(() => null);

    await newsTable?.delete(`${guild.id}.news.${providedId}`).catch(() => null);
    await interaction.followUp({ embeds: [embed] });
  }
}
