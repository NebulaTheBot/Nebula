const { getFiles, requireReload } = require("../utils/misc");
const chalk = require("chalk");
const path = require("path");

module.exports = class Events {
  constructor(client, commands) {
    this.client = client;
    this.commands = commands;
    this.events = [];
    this.eventFiles = getFiles(path.join(process.cwd(), "src", "events"), ".js");

    (async () => {
      try {
        for (const eventTest of this.eventFiles) {
          const eventFile = requireReload(eventTest);
          const event = new (eventFile.event)(this.client, this.commands, this);
          const clientEvent = this.client.on(eventFile.name, event.run);

          this.events.push({ name: eventFile.name, event: clientEvent });
        };
      } catch (error) {
        if (error instanceof TypeError) console.error(`An error occurred while starting events: ${error.message}`);
        else throw error;
      }
    })();

    console.log(chalk.greenBright("Events? Registered."));
  }
}
