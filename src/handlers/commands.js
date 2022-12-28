const { getFiles, getFolders, requireReload } = require("../utils/misc");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const { SlashCommandBuilder } = require("discord.js");

module.exports = class Commands {
  constructor(client) {
    this.client = client;
    this.commandFiles = getFiles(path.join(process.cwd(), "src", "commands"));
    this.subcommandFiles = getFolders(path.join(process.cwd(), "src", "commands"), ".js");

    (async () => {
      try {
        for (const commandFile of this.commandFiles) {
          const stats = fs.statSync(commandFile);

          if (stats.isDirectory()) {
            console.log(stats.name); // undefined
            let commandFolder = SlashCommandBuilder()
              .name = commandFile;

            for (const subcommandFile of this.subcommandFiles) {
              const subcommand = requireReload(subcommandFile);
              const subcommandData = new (subcommand)(this.client, this.subcommands, this).data;
              console.log(subcommandData);
              commandFolder.options.push(subcommandData);
            }
            await this.client.application.commands.create(commandFolder);
          }
          if (stats.isFile()) {
            const command = requireReload(commandFile);
            const commandData = new (command)(this.client, this.commands, this).data;

            await this.client.application.commands.set([]);
            await this.client.application.commands.create(commandData);
          }
        }
        console.log(chalk.greenBright("Commands? Registered."));
      } catch (error) {
        if (error instanceof TypeError) console.error(chalk.redBright(`An error occurred while setting the commands: ${error.message}`));
        else throw error;
      }
    })();
  }
}
