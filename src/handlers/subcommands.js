const { getFiles, requireReload } = require("../utils/misc");
const path = require("path");
const chalk = require("chalk");

module.exports = class Subcommands { 
  constructor(client) {
    this.client = client;
    this.subcommands = [];
    this.subcommandFiles = getFiles(path.join(process.cwd(), "src", "subcommands"), ".js");

    (async () => {
      try {
        for (const subcommand of this.subcommandFiles) this.loadSubcommand(subcommand);
        await this.client.subcommands.set(this.subcommands);
      } catch (error) {
        if (error instanceof TypeError) console.error(`An error occurred while setting the subcommands: ${error.message}`);
        else throw error;
      }
    })();

    console.log(chalk.greenBright("Subcommands? Registered."));
  }

  async loadSubcommand(name) {
    const findSubcommandFile = this.subcommandFiles.find(subcommandFile => subcommandFile === name);
    const subcommandFile = requireReload(findSubcommandFile);
    const subcommand = new (subcommandFile)(this.client, this.subcommands, this);

    this.subcommands.push(subcommand);
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
    await this.client.subcommands.delete(this.subcommands);
  }

  async removeSubcommand(name) {
    const findSubcommandFile = this.subcommandFiles.find(subcommandFile => subcommandFile === name);
    const subcommandFile = requireReload(findSubcommandFile);
    if (subcommandFile == null) return false;

    await this.client.subcommands.delete(subcommandFile);
    return true;
  }
}
