const { getFiles, requireReload } = require("../utils/misc");
const path = require("path");
const chalk = require("chalk");

module.exports = class Subcommands { 
  constructor(client) {
    this.client = client;
    this.subcommandFiles = getFiles(path.join(process.cwd(), "src", "subcommands"), ".js");

    (async () => {
      try {
        for (const subcommandFile of this.subcommandFiles) {
          const subcommand = requireReload(subcommandFile);
          const subcommandData = new (subcommand)(this.client, this.subcommands, this).data;
      
          await this.client.subcommands.set(subcommandData);
        };
      } catch (error) {
        if (error instanceof TypeError) console.error(`An error occurred while setting the subcommands: ${error.message}`);
        else throw error;
      }
    })();

    console.log(chalk.greenBright("Subcommands? Registered."));
  }
}
