const { getFiles, requireReload } = require("../utils/misc");
const path = require("path");
const chalk = require("chalk");

module.exports = class Commands {
  constructor(client) {
    this.client = client;
    this.commandFiles = getFiles(path.join(process.cwd(), "src", "commands"), ".js");

    (async () => {
      try {
        for (const commandFile of this.commandFiles) {
          const command = requireReload(commandFile);
          const commandData = new (command)(this.client, this.commands, this).data;
      
          await this.client.application.commands.create(commandData);
        };
      } catch (error) {
        if (error instanceof TypeError) console.error(`An error occurred while setting the commands: ${error.message}`);
        else throw error;
      }
    })();

    console.log(chalk.greenBright("Commands? Registered."));
  }
}
