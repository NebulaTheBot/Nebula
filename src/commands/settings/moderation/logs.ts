import {
  SlashCommandSubcommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
  type ChatInputCommandInteraction,
  ChannelType,
} from "discord.js";
import { genColor } from "../../../utils/colorGen.js";
import errorEmbed from "../../../utils/embeds/errorEmbed.js";
import { QuickDB } from "quick.db";
import { getSettingsTable } from "../../../utils/database.js";

export default class Logs {
  data: SlashCommandSubcommandBuilder;
  db: QuickDB<any>;

  constructor(db?: QuickDB<any>) {
    this.db = db;
    this.data = new SlashCommandSubcommandBuilder()
      .setName("logs")
      .setDescription("Sets/Remove the logs channel.")
      .addChannelOption(option =>
        option.setName("channel")
          .setDescription("Where to send logs in. Empty = deleted.")
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    const db = this.db;
    const settingsTable = await getSettingsTable(db);

    const member = interaction.guild.members.cache.get(interaction.user.id);

    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return await interaction.followUp({
        embeds: [errorEmbed("You need **Manage Server** permissions to list commands.")],
      });
    }

    const specifiedChannel = interaction.options.getChannel("channel");
    if (specifiedChannel?.type != ChannelType.GuildText) return await interaction.followUp({ embeds: [errorEmbed("You must provide a text channel.")] });

    if (!specifiedChannel?.id) await settingsTable?.delete(`${interaction.guild.id}.logChannel`);
    else await settingsTable?.set(`${interaction.guild.id}.logChannel`, specifiedChannel?.id)

    const listEmbed = new EmbedBuilder()
      .setTitle("📃 • Log channel")
      .setDescription(`The log channel has been ${specifiedChannel?.id ? `set to <#${specifiedChannel.id}>` : "deleted"}.`)
      .setColor(genColor(100));

    return await interaction.followUp({ embeds: [listEmbed] });
  }
}
