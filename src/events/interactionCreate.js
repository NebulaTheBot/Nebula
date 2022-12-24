const { getFiles, requireReload } = require("../utils/misc");
const path = require("path");

module.exports = {
  name: "interactionCreate",
  event: class InteractionCreate {
    constructor(client, commands, subcommands, events) {
      this.client = client;
      this.commands = commands;
      this.subcommands = subcommands;
      this.events = events;
    }

    async run(interaction) {
      const { commandName } = interaction;
      if (!interaction.isChatInputCommand()) return;
      await interaction.deferReply();

      // const commandFiles = getFiles(path.join(process.cwd(), "src", "commands"), ".js");
      // const findCommandFile = commandFiles.find(file => file.indexOf(`${interaction.commandName}.js`) !== -1);
      // const commandFile = requireReload(findCommandFile);
      // const command = new (commandFile)(this.client, this.commands, this);
      const subcommandGroup = interaction.options.getSubcommandGroup(false);
      const subcommandName = interaction.options.getSubcommand(false);
      const cmd = this.client.slashCommands.get(commandName);

      console.log(cmd);
      console.log(subcommandGroup, subcommandName);

      if (subcommandName) {
        if (subcommandGroup) this.client.slashSubcommands.get(commandName).groupCommands
          .get(subcommandGroup)
          .get(subcommandName)
          .run(client, interaction);
        else this.client.slashSubcommands.get(commandName).groupCommands
          .get(subcommandName)
          .run(client, interaction);

        return;
      }

      cmd.run(interaction);
    }
  }
}
