import type { CommandInteraction, Client, AutocompleteInteraction } from "discord.js";
import { pathToFileURL } from "url";
import { join } from "path";

async function getCommand(
  interaction: CommandInteraction | AutocompleteInteraction,
  options: any
): Promise<any> {
  const commandName = interaction.commandName;
  const subcommandName = options.getSubcommand(false);
  const commandGroupName = options.getSubcommandGroup(false);
  const commandImportPath = join(
    join(process.cwd(), "src", "commands"),
    `${
      subcommandName
        ? `${commandName}/${
            commandGroupName ? `${commandGroupName}/${subcommandName}` : subcommandName
          }`
        : commandName
    }.ts`
  );

  return new (await import(pathToFileURL(commandImportPath).toString())).default();
}

export default {
  name: "interactionCreate",
  event: class InteractionCreate {
    commands: CommandInteraction;
    client: Client;
    constructor(cmds: CommandInteraction, client: Client) {
      this.commands = cmds;
      this.client = client;
    }

    async run(interaction: CommandInteraction | AutocompleteInteraction) {
      if (interaction.isChatInputCommand()) {
        const command = await getCommand(interaction, interaction.options);
        if (!command) return;
        if (command.deferred === true) await interaction.deferReply();
        command.run(interaction);
      } else if (interaction.isAutocomplete()) {
        const command = await getCommand(interaction, interaction.options);
        if (!command) return;
        if (!command.autocomplete) return;
        command.autocomplete(interaction);
      }
    }
  }
};
