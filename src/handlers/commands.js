const { getFiles, requireReload } = require("../utils/misc");
const path = require("path");
const chalk = require("chalk");
const AsciiTable = require("ascii-table");

module.exports = class Commands {
  constructor(client) {
    this.client = client;
    this.commands = [];
    this.commandFiles = getFiles(path.join(process.cwd(), "src", "commands"), ".js");
    this.table = new AsciiTable()
      .setHeading("Commands", "State")
      .setBorder("|", "-", "0", "0");

    (async () => {
      try {
        for (const command of this.commandFiles) this.loadCommand(command);
        await this.client.commands.set(this.commands).catch(() => {});
      } catch (error) {
        if (error instanceof TypeError) {
          console.error(`An error occurred while setting the commands: ${error.message}`);
        } else {
          throw error;
        }
      }
    })();

    console.log(chalk.blue(this.table.toString()));
    console.log(chalk.greenBright("Commands? Registered."));
  }

  async loadCommand(name) {
    const findCommandFile = this.commandFiles.find(commandFile => commandFile === name);
    const commandFile = requireReload(findCommandFile);
    const command = new (commandFile)(this.client, this.commands, this).data;

    this.commands.push(command);
    this.table.addRow(command.name, "✅");
  }

  async reloadCommands() {
    await this.removeCommands();
    for (const command of this.commandFiles) this.loadCommand(command);
  }

  reloadCommand(name) {
    this.removeCommand(name);

    const findCommandFile = this.commandFiles.find(commandFile => commandFile === name);
    const commandFile = requireReload(findCommandFile);
    const command = new (commandFile)(this.client, this.commands, this).data;

    this.loadCommand(command);
  }

  async removeCommands() {
    await this.client.commands.delete(this.commands);
  }

  async removeCommand(name) {
    const findCommandFile = this.commandFiles.find(commandFile => commandFile === name);
    const commandFile = requireReload(findCommandFile);
    if (commandFile == null) return false;

    await this.client.commands.delete(commandFile).catch(() => {});
    return true;
  }
}
