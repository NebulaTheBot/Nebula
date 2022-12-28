const { getFiles, requireReload } = require("../utils/misc");
const path = require("path");
const chalk = require("chalk");

module.exports = {
  name: "interactionCreate",
  event: class InteractionCreate {
    constructor(commands, subcommands, events) {
      this.commands = commands;
      this.subcommands = subcommands;
      this.events = events;
    }

    async run(interaction) {
      if (!interaction.isChatInputCommand()) return;
      await interaction.deferReply();
      try {
        const commandFiles = getFiles(path.join(process.cwd(), "src", "commands"), ".js");
        const findCommandFile = commandFiles.find(file => file.indexOf(`${interaction.commandName}.js`) !== -1);
        const commandFile = requireReload(findCommandFile);
        const command = new (commandFile)(this.client, this.commands, this);

        const subcommandGroup = interaction.options.getSubcommandGroup(false);
        const subcommandName = interaction.options.getSubcommand(false);
        console.log(subcommandGroup, subcommandName);
  
        if (subcommandName) {
          if (subcommandGroup) this.client.application.commands.get(command.data.name).groupCommands
            .get(subcommandGroup)
            .get(subcommandName)
            .run(interaction);
          else this.client.application.commands.get(command.data.name).groupCommands
            .get(subcommandName)
            .run(interaction);
   
          return;
        }
  
        command.run(interaction);
      } catch (error) {
        if (error instanceof TypeError) console.error(chalk.redBright(`An error occurred while executing: ${error.message}`));
        else throw error;
      }
    }
  }
}
