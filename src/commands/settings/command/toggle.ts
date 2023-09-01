import {
  SlashCommandSubcommandBuilder, EmbedBuilder, PermissionsBitField,
  type ChatInputCommandInteraction
} from "discord.js";
import { genColor } from "../../../utils/colorGen.js";
import Commands from "../../../handlers/commands.js";
import { getSettingsTable } from "../../../utils/database.js";
import errorEmbed from "../../../utils/embeds/errorEmbed.js";
import { QuickDB } from "quick.db";

export default class Toggle {
  data: SlashCommandSubcommandBuilder;
  db: QuickDB<any>;

  constructor(db?: QuickDB<any>) {
    this.db = db;
    this.data = new SlashCommandSubcommandBuilder()
      .setName("toggle")
      .setDescription("Enables/disables a command.")
      .addStringOption(option => option
        .setName("command")
        .setDescription("Layout: \"/topcommand (subcommand) (group)\".")
        .setRequired(true)
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    const db = this.db;
    const settingsTable = await getSettingsTable(db);

    const commands = new Commands(interaction.client);
    await commands.loadCommands();

    const commandPath = interaction.options.getString("command", true);
    let [commandName, subcommandName, subcommandGroupName] = commandPath.split(" ");
    commandName = commandName.replace("/", "");
    const disabledCommands = await settingsTable?.get(`${interaction.guild.id}.disabledCommands`).then(
      (disabledCommands) => disabledCommands as any[] ?? []
    ).catch(() => []);

    const hasCommand = (name: string, subcommand?: string, subcommandGroup?: string) => {
      return commands.commands.some(command =>
        command.name === name &&
        (!subcommand || command.options.some(opt => opt.name === subcommand)) &&
        (!subcommandGroup || command.options.some(
          opt => opt.type === "SUB_COMMAND_GROUP" && opt.options?.some(opt => opt.name === subcommandGroup)
        ))
      );
    };

    const member = interaction.guild.members.cache.get(interaction.user.id);
    const isEnabled = !disabledCommands.includes(commandName);
    const updatedDisabledCommands = !isEnabled
      ? disabledCommands.filter((cmd) => cmd !== commandName)
      : [...disabledCommands, commandName];

    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild))
      return await interaction.followUp({
        embeds: [errorEmbed("You need the **Manage Server** permission to enable commands.")],
      });

    if (!hasCommand(commandName, subcommandName, subcommandGroupName)) {
      return await interaction.followUp({ embeds: [errorEmbed("The specified command doesn't exist.")] });
    }

    const embed = new EmbedBuilder()
      .setTitle(`⌚ • ${isEnabled ? "Disabling" : "Enabling"} ${commandPath}.`)
      .setDescription("The command hasn't been updated yet, we will edit this message once it has.")
      .setColor(genColor(100));

    interaction.followUp({ embeds: [embed] });
    await settingsTable.set(`${interaction.guild.id}.disabledCommands`, updatedDisabledCommands);

    commands.registerCommandsForGuild(interaction.guild, ...updatedDisabledCommands).then(() => {
      embed
        .setTitle(`✅ • ${isEnabled ? "Disabled" : "Enabled"} ${commandPath}.`)
        .setDescription(`The command has been ${isEnabled ? "disabled." : "enabled."}`);

      interaction.editReply({ embeds: [embed] });
    });
  }
}
