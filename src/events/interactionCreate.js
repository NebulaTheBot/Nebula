const { getFiles, requireReload } = require("../utils/misc");
const path = require("path");

module.exports = {
  name: "interactionCreate",
  event: class InteractionCreate {
    constructor(commands, events) {
      this.commands = commands;
      // this.subcommands = subcommands;
      this.events = events;
    }

    async run(interaction) {
      console.log(interaction.client);
      if (!interaction.isChatInputCommand()) return;
      await interaction.deferReply();
      try {
        const commandFiles = getFiles(path.join(process.cwd(), "src", "commands"), ".js");
        const findCommandFile = commandFiles.find(file => file.indexOf(`${interaction.commandName}.js`) !== -1);
        const commandFile = requireReload(findCommandFile);
        const command = new (commandFile)(this.client, this.commands, this);
        // console.log(subcommandGroup, subcommandName);
  
        // if (subcommandName) {
        //   if (subcommandGroup) this.client.subcommands.get(commandName).groupCommands
        //     .get(subcommandGroup)
        //     .get(subcommandName)
        //     .run(interaction);
        //   else this.client.subcommands.get(commandName).groupCommands
        //     .get(subcommandName)
        //     .run(interaction);
   
        //   return;
        // }
  
        command.run(interaction);
      } catch (error) {
        if (error instanceof TypeError) console.error(`An error occurred while executing: ${error.message}`);
        else throw error;
      }
    }
  }
}
