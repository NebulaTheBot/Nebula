import {
  SlashCommandSubcommandBuilder, EmbedBuilder, PermissionsBitField,
  type ChatInputCommandInteraction
} from "discord.js";
import { genColor } from "../../../utils/colorGen.js";
import { errorEmbed } from "../../../utils/embeds/errorEmbed.js";
import { QuickDB } from "quick.db";
import { getSettingsTable } from "../../../utils/database.js";

export default class List {
  data: SlashCommandSubcommandBuilder;
  db: QuickDB<any>;

  constructor(db?: QuickDB<any>) {
    this.db = db;
    this.data = new SlashCommandSubcommandBuilder()
      .setName("list")
      .setDescription("Lists all disabled commands.");
  }

  async run(interaction: ChatInputCommandInteraction) {
    const db = this.db;
    const settingsTable = await getSettingsTable(db);
    const member = interaction.guild.members.cache.get(interaction.user.id);

    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild)) return await interaction.followUp({
      embeds: [errorEmbed("You need **Manage Server** permissions to list commands.")],
    });

    const disabledCommands = await settingsTable
      ?.get(`${interaction.guild.id}.disabledCommands`)
      .then((disabledCommands) => disabledCommands as any[] ?? [])
      .catch(() => []);

    const listEmbed = new EmbedBuilder()
      .setTitle("📃 • Disabled commands")
      .setDescription(
        !disabledCommands || disabledCommands?.length == 0
          ? "There are no disabled commands."
          : disabledCommands
            .map(command => {
              const [commandName, subcommandName] = command.split("/");
              return `/${commandName}${subcommandName ? ` ${subcommandName}` : ""}`;
            })
            .join("\n")
      )
      .setColor(genColor(100));

    return await interaction.followUp({ embeds: [listEmbed] });
  }
}
