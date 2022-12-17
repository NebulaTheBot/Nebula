const { getFiles, requireReload } = require("../utils/misc");
const path = require("path");
const chalk = require("chalk");
const AsciiTable = require("ascii-table");

module.exports = class Subcommands { 
  constructor(client) {
    this.client = client;
    this.subcommands = [];
    this.subcommandFiles = getFiles(path.join(process.cwd(), "src", "subcommands"), ".js");
    this.table = new AsciiTable()
      .setHeading("Subcommands", "State")
      .setBorder("|", "-", "0", "0");

    (async () => {
      for (const subcommand of this.subcommandFiles) this.loadSubcommand(subcommand);
      for (const guildID of this.client.guilds.cache.keys()) {
        const guild = this.client.guilds.cache.get(guildID);
        await guild.subCommands.set(this.subcommands).catch(() => {});
      }
    })();

    console.log(chalk.cyan(this.table.toString()));
    console.log(chalk.greenBright("Subcommands? Registered."));
  }

  async loadSubcommand(name) {
    const findSubcommandFile = this.subcommandFiles.find(subcommandFile => subcommandFile === name);
    const subcommandFile = requireReload(findSubcommandFile);
    console.log(subcommandFile)
    const subcommand = new (subcommandFile)(this.client, this.subcommands, this);
    console.log(subcommand);

    this.subcommands.push(subcommand);
    this.table.addRow(subcommand.name, "✅");
  }

  async reloadSubcommands() {
    await this.removeSubcommands();
    for (const subcommand of this.subcommandFiles) this.loadSubcommand(subcommand);
  }

  reloadSubcommand(name) {
    this.removeSubcommand(name);
    this.loadSubcommand(name);
  }

  async removeSubcommands() {
    for (const guildID of this.client.guilds.cache.keys()) {
      const guild = this.client.guilds.cache.get(guildID);
      await guild.subCommands.delete(this.subcommands).catch(() => {});
    }
  }

  async removeSubcommand(name) {
    const findSubcommandFile = this.subcommandFiles.find(subcommandFile => subcommandFile === name);
    const subcommandFile = requireReload(findSubcommandFile);
    if (subcommandFile == null) return false;

    for (const guildID of this.client.guilds.cache.keys()) {
      const guild = this.client.guilds.cache.get(guildID);
      await guild.subCommands.delete(subcommandFile).catch(() => {});
    }
    return true;
  }
}
