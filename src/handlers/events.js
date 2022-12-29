const { getFiles, requireReload } = require("../utils/misc");
const chalk = require("chalk");
const path = require("path");

module.exports = class Events {
  constructor(client, commands) {
    this.client = client;
    this.commands = commands;
    this.events = [];
    this.eventFiles = getFiles(path.join(process.cwd(), "src", "events"));

    (async () => {
      try {
        for (const eventFile of this.eventFiles) {
          const event = requireReload(eventFile);
          const eventConstructor = new (event.event)(this.client, this.commands, this);
          const clientEvent = this.client.on(event.name, eventConstructor.run);

          this.events.push({ name: event.name, event: clientEvent });
        }
        console.log(chalk.greenBright("Events? Registered."));
      } catch (error) {
        if (error instanceof TypeError) console.error(chalk.redBright(`An error occurred while starting events: ${error.message}`));
        else throw error;
      }
    })();
  }
}
