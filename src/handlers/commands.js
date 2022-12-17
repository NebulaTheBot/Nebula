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
      for (const command of this.commandFiles) this.loadCommand(command);
      for (const guildID of this.client.guilds.cache.keys()) {
        const guild = this.client.guilds.cache.get(guildID);
        await guild.commands.set(this.commands).catch(() => {});
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
    for (const guildID of this.client.guilds.cache.keys()) {
      const guild = this.client.guilds.cache.get(guildID);
      await guild.commands.delete(this.commands).catch(() => {});
    }
  }

  async removeCommand(name) {
    const findCommandFile = this.commandFiles.find(commandFile => commandFile === name);
    const commandFile = requireReload(findCommandFile);
    if (commandFile == null) return false;

    for (const guildID of this.client.guilds.cache.keys()) {
      const guild = this.client.guilds.cache.get(guildID);
      await guild.commands.delete(commandFile).catch(() => {});
    }
    return true;
  }
}
