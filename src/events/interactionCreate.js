const { getFiles, requireReload } = require("../utils/misc");
const path = require("path");
const chalk = require("chalk");

module.exports = {
  name: "interactionCreate",
  event: class InteractionCreate {
    constructor(commands, events) {
      this.commands = commands;
      this.events = events;
    }

    async run(interaction) {
      if (!interaction.isChatInputCommand()) return;
      await interaction.deferReply();
      try {
        const subcommand = interaction.options.getSubcommand(false);
        const subcommandGroup = interaction.options.getSubcommandGroup(false);

        const commandFiles = getFiles(
          path.join(process.cwd(), "src", "commands", (subcommand ? interaction.commandName : ""), (subcommandGroup ? interaction.options._group : ""))
        );
        const findCommandFile = commandFiles
          .find(file => file.indexOf(`${subcommand ? subcommand : interaction.commandName}.js`) !== -1);

        const commandFile = requireReload(findCommandFile);
        const command = new (commandFile)(this.client, this.commands, this);

        command.run(interaction);
      } catch (error) {
        if (error instanceof TypeError) console.error(chalk.redBright(`What is it? It's an interactionCreate error! ${error.stack}`));
        else throw error;
      }
    }
  }
}
