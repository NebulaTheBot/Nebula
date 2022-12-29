const { getFiles, requireReload } = require("../utils/misc");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const { SlashCommandBuilder } = require("discord.js");

module.exports = class Commands {
  constructor(client) {
    this.client = client;
    this.commandFiles = getFiles(path.join(process.cwd(), "src", "commands"));

    (async () => {
      await this.client.application.commands.set([]).catch(console.error);
      try {
        for (const commandFile of this.commandFiles) {
          const stats = fs.statSync(commandFile);
          let commandName = commandFile.split("\\").join("/").split("/").slice(-1)[0];

          if (stats.isDirectory()) {
            let commandFolder = new SlashCommandBuilder()
              .setName(commandName)
              .setDescription("Entity is a great bot");

            const subcommandFiles = getFiles(path.join(process.cwd(), "src", "commands", commandName));
            for (const subcommandFile of subcommandFiles) {
              const subcommand = requireReload(subcommandFile);
              const subcommandData = new (subcommand)(this.client, this).data;

              commandFolder.options.push(subcommandData);
            }
            await this.client.application.commands.create(commandFolder);
          }
          if (stats.isFile()) {
            const command = requireReload(commandFile);
            const commandData = new (command)(this.client, this).data;
            
            await this.client.application.commands.create(commandData);
          }
          console.log(chalk.greenBright(`${commandName}? Registered.`));
        }
      } catch (error) {
        if (error instanceof TypeError) console.error(chalk.redBright(`An error occurred while setting the commands: ${error.message}\nStack: ${error.stack}`));
        else throw error;
      }
    })();
  }
}
