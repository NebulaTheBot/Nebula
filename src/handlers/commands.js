const getFiles = require("../utils/getFiles");
const { requireReload } = require("../constants");
const path = require("path");
const chalk = require("chalk");
const AsciiTable = require("ascii-table");

const table = new AsciiTable()
  .setHeading("Commands", "State")
  .setBorder("|", "-", "0", "0");

class Commands {
  commands = [];
  client = null;
  commandFiles = getFiles(path.join(process.cwd(), "src", "commands"), ".js");
  
  constructor(client) {
    this.client = client;
    this.reloadCommands(false);
    for (const command of this.commands) table.addRow(command.name, "✅");

    console.log(chalk.blue(table.toString()));
    console.log(chalk.greenBright("Commands? Registered."));
  }

  reloadCommands = async (remCmds = true) => {
    for (const command of this.commandFiles) this.reloadCommand(command, remCmds);

    for (const guildID of this.client.guilds.cache.keys()) {
      const guild = this.client.guilds.cache.get(guildID);
      await guild.commands.set(this.commands).catch(() => {});
    };
  }

  reloadCommand = (name, remCmds = true) => {
    if (remCmds) this.removeCommand(name);

    const findCommandFile = this.commandFiles.find(commandFile => commandFile === name);
    const commandOptions = requireReload(findCommandFile)?.options[0];
    if (!commandOptions) return;

    this.commands.push(commandOptions);
  }

  removeCommands = async () => {
    for (const guildID of this.client.guilds.cache.keys()) {
      const guild = this.client.guilds.cache.get(guildID);
      await guild.commands.delete(this.commands).catch(() => {});
    };
  }

  removeCommand = async name => {
    const findCommandFile = this.commandFiles.find(commandFile => commandFile === name);
    const commandOptions = requireReload(findCommandFile)?.options[0];
    if (commandOptions == null) return false;

    for (const guildID of this.client.guilds.cache.keys()) {
      const guild = this.client.guilds.cache.get(guildID);
      await guild.commands.delete(commandOptions).catch(() => {});
    };
    return true;
  }
}

module.exports = Commands;
