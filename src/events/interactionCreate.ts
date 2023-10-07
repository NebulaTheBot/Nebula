import { CommandInteraction, Client, AutocompleteInteraction } from "discord.js";
import { pathToFileURL } from "url";
import { join } from "path";
import { QuickDB } from "quick.db";
import { database } from "../utils/database.js";

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

      const options: any = interaction.options;
      const commandName = interaction.commandName;
      const subcommandName = options.getSubcommand(false);
      const commandgroupName = options.getSubcommandGroup(false);

      const commandImportPath = join(
        join(process.cwd(), "src", "commands"),
        `${subcommandName ? `${commandName}/${commandgroupName ? `${commandgroupName}/${subcommandName}` : subcommandName}` : commandName}.ts`
      );
      const command = new (await import(pathToFileURL(commandImportPath).toString())).default(this.db);

      if (interaction.isChatInputCommand()) {
        const deferred = command?.deferred ?? true;
        if (deferred) await interaction.deferReply();
        command.run(interaction);
      } else if (interaction.isAutocomplete()) {
        if (!command.autocomplete) return;
        command.autocomplete(interaction);
      }
    }
  }
};
