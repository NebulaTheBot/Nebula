import { SlashCommandBuilder, SlashCommandSubcommandGroupBuilder, Guild, type Client } from "discord.js";
import { pathToFileURL } from "url";
import { join } from "path";
import { readdirSync } from "fs";
import database, { getSettingsTable } from "../utils/database.js";
import { QuickDB } from "quick.db";

const COMMANDS_PATH = join(process.cwd(), "dist", "commands");
export default class Commands {
  client: Client;
  commands: any[] = [];
  db: QuickDB<any>;

  constructor(client?: Client) {
    this.client = client;
  }

  // Load the commands into this.commands
  private async createSubCommand(name: string, ...disabledCommands: string[]): Promise<SlashCommandBuilder> {
    const command = new SlashCommandBuilder()
      .setName(name.toLowerCase())
      .setDescription("This command has no description.");

    // Fetch the subcommands
    const subCommandFiles = readdirSync(join(COMMANDS_PATH, name), { withFileTypes: true });

    // Add the subcommands to the top command
    for (const subCommandFile of subCommandFiles) {
      const subCommandName = subCommandFile.name.replaceAll(".js", "");
      if (
        disabledCommands?.find(
          (command) => command?.split("/")?.[0] == name && command?.split("/")?.[1] == subCommandName
        )
      ) continue;

      if (subCommandFile.isFile()) {
        const subCommand = await import(pathToFileURL(join(COMMANDS_PATH, name, subCommandFile.name)).toString());
        try {
          command.addSubcommand(new subCommand.default().data);
        } catch {}
        continue;
      }

      const subCommandGroup = new SlashCommandSubcommandGroupBuilder()
        .setName(subCommandName.toLowerCase())
        .setDescription("This subcommand group has no description.");

      const subCommandGroupFiles = readdirSync(join(COMMANDS_PATH, name, subCommandFile.name), { withFileTypes: true });

      for (const subCommandGroupFile of subCommandGroupFiles) {
        if (!subCommandGroupFile.isFile()) continue;
        if (
          disabledCommands?.find(
            (command) =>
              command?.split("/")?.[0] == name &&
              command?.split("/")?.[1] == subCommandFile.name.replaceAll(".js", "") &&
              command?.split("/")?.[2] == subCommandGroupFile.name.replaceAll(".js", "")
          )
        ) continue;

        const subCommand = await import(
          pathToFileURL(join(COMMANDS_PATH, name, subCommandFile.name, subCommandGroupFile.name)).toString()
        );
        subCommandGroup.addSubcommand(new subCommand.default().data);
      }
      command.addSubcommandGroup(subCommandGroup);
    }

    return command;
  }

  async loadCommands(...disabledCommands: string[]) {
    this.commands = [];
    const commandFiles = readdirSync(COMMANDS_PATH, { withFileTypes: true });

    for (const commandFile of commandFiles) {
      const name = commandFile.name;
      if (disabledCommands?.includes(name.replaceAll(".js", ""))) continue;

      if (commandFile.isFile()) {
        // Add the commands it found to the list
        const command = await import(pathToFileURL(join(COMMANDS_PATH, name)).toString());
        this.commands.push(new command.default().data);
        continue;
      }

      // Folder found -> Make subcommand
      // Create a top subcommand
      const subCommand = await this.createSubCommand(name, join(COMMANDS_PATH, name), ...disabledCommands);
      this.commands.push(subCommand);
    }
  }

  // Register the commands for a specific guild
  async registerCommandsForGuild(guild: Guild, ...disabledCommands: string[]) {
    await this.loadCommands(...disabledCommands);
    await guild.commands.set(this.commands);
  }

  // Register the commands for all guilds
  async registerCommands(): Promise<any[]> {
    const db = await database();
    await this.loadCommands();
    const settingsTable = await getSettingsTable(db);
    const guilds = this.client.guilds.cache;

    // Adding the commands to the guilds
    console.log("Adding commands to guilds...");
    for (const guildID of guilds.keys()) {
      const disabledCommands = await settingsTable?.get(`${guildID}.disabledCommands`).then(
        (disabledCommands: string[]) => disabledCommands as string[] ?? [] as string[]
      ).catch(() => [] as string[]);
      if (disabledCommands.length > 0) await this.loadCommands(...disabledCommands);
      await guilds.get(guildID)?.commands.set(this.commands);
    }

    return this.commands;
  }
}
