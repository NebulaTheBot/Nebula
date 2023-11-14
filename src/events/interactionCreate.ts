import type { CommandInteraction, Client, AutocompleteInteraction } from "discord.js";
import type { QuickDB } from "quick.db";
import { pathToFileURL } from "url";
import { join } from "path";
import { database } from "../utils/database.js";

async function getCommand(interaction: CommandInteraction | AutocompleteInteraction, options: any, db: QuickDB<any>): Promise<any> {
  const commandName = interaction.commandName;
  const subcommandName = options.getSubcommand(false);
  const commandgroupName = options.getSubcommandGroup(false);

  const commandImportPath = join(
    join(process.cwd(), "src", "commands"),
    `${subcommandName ? `${commandName}/${commandgroupName ? `${commandgroupName}/${subcommandName}` : subcommandName}` : commandName}.ts`
  );

  return new (await import(pathToFileURL(commandImportPath).toString())).default(db);
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

    async run(interaction: CommandInteraction | AutocompleteInteraction) {
      if (!this.db) this.db = await database();
      if (Date.now() - this.lastOpenedDb > 1000 * 60 * 60) {
        this.db = await database();
        this.lastOpenedDb = Date.now();
      }

      if (interaction.isChatInputCommand()) {
        const command = await getCommand(interaction, interaction.options, this.db);
        if (!command) return;
        if (command?.deferred ?? true) await interaction.deferReply();
        command.run(interaction);
      } else if (interaction.isAutocomplete()) {
        const command = await getCommand(interaction, interaction.options, this.db);
        if (!command) return;
        if (!command.autocomplete) return;
        command.autocomplete(interaction);
      }
    }
  }
}
