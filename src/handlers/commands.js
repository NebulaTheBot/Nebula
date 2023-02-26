const { SlashCommandBuilder, SlashCommandSubcommandGroupBuilder } = require("discord.js");
const { getFiles, requireReload } = require("../utils/misc");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

module.exports = class Commands {
  constructor(client) {
    this.client = client;
    this.commands = [];
    this.commandFiles = getFiles(path.join(process.cwd(), "src", "commands"));

    (async () => {
      for (const commandFile of this.commandFiles) {
        const stats = fs.statSync(commandFile);
        const commandName = commandFile.split("\\").join("/").split("/").slice(-1)[0];
          
        if (stats.isFile()) {
          const command = requireReload(commandFile);
          const commandData = new (command)(this.client, this).data;

          this.commands.push(commandData);
          continue;
        }
          
        const commandFolder = new SlashCommandBuilder()
          .setName(commandName)
          .setDescription("Nebula is a great bot");
            
        const subcommandFiles = getFiles(path.join(process.cwd(), "src", "commands", commandName));
        for (const subcommandFile of subcommandFiles) {
          const stats = fs.statSync(subcommandFile);
          const subcommandName = subcommandFile.split("\\").join("/").split("/").slice(-1)[0];

          if (stats.isFile()) {
            const subcommand = requireReload(subcommandFile);
            const subcommandData = new (subcommand)(this.client, this).data;

            commandFolder.options.push(subcommandData);
            continue;
          }

          const subcommandFolder = new SlashCommandSubcommandGroupBuilder()
            .setName(subcommandName)
            .setDescription("Nebula is a great bot");

          const subcommandGroupFiles = getFiles(path.join(process.cwd(), "src", "commands", commandName, subcommandName));
          for (const subcommandGroupFile of subcommandGroupFiles) {
            const subcommand = requireReload(subcommandGroupFile);
            const subcommandData = new (subcommand)(this.client, this).data;
    
            subcommandFolder.options.push(subcommandData);
          }
          commandFolder.options.push(subcommandFolder);      
        }
        this.commands.push(commandFolder);
      }
      await this.client.application.commands.set(this.commands); // replace this.commands with [] in case you wanna remove commands
      console.log(chalk.greenBright(`Commands? Registered.`));
    })();
  }
}
