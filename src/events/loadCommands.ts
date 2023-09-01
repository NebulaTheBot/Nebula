import type { CommandInteraction, Interaction, Client, AutocompleteInteraction } from "discord.js";
import { pathToFileURL } from "url";
import { join } from "path";
import database from "../utils/database.js";
import { QuickDB } from "quick.db";

const COMMANDS_PATH = join(process.cwd(), "dist", "commands");

async function getCommand(interaction: CommandInteraction | AutocompleteInteraction, options: any, db: QuickDB<any>): Promise<any> {
  const commandName = interaction.commandName;
  const subcommandName = options.getSubcommand(false);
  const commandgroupName = options.getSubcommandGroup(false);

  const commandImportPath = join(
    COMMANDS_PATH,
    `${subcommandName ?
    `${commandName}/${commandgroupName ?
    `${commandgroupName}/${subcommandName}` :
    subcommandName}` :
    commandName}.js`
  );
  const command = new (await import(pathToFileURL(commandImportPath).toString())).default(db);
  return command;
}

export default {
  name: "interactionCreate",
  event: class InteractionCreate {
    commands: CommandInteraction;
    client: Client;
    lastOpenedDb = Date.now();
    db: QuickDB<any> = null;

    constructor(cmds: CommandInteraction, client: Client) {
      this.commands = cmds;
      this.client = client;
      this.lastOpenedDb = Date.now();
    }

    async run(interaction: Interaction) {
      if (!this.db) this.db = await database();
      if (Date.now() - this.lastOpenedDb > 1000 * 60 * 60) {
        this.db = await database();
        this.lastOpenedDb = Date.now();
      }

      if (interaction.isChatInputCommand()) {
        const options = interaction.options

        // Command names
        const command = await getCommand(interaction, options, this.db).catch(() => null);
        if (!command) return;

        const deferred = command?.deferred ?? true;
        if (deferred) await interaction.deferReply();

        command.run(interaction);
      } else if (interaction.isAutocomplete()) {
        const options = interaction.options;

        const command = await getCommand(interaction, options, this.db).catch(() => null);
        if (!command) return;
        if (!command.autocomplete) return;
        command.autocomplete(interaction);
      }
    }
  }
};
