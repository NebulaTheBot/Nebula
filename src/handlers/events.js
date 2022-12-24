const { getFiles, requireReload } = require("../utils/misc");
const chalk = require("chalk");
const path = require("path");

module.exports = class Events {
  constructor(client, commands) {
    this.client = client;
    this.commands = commands;
    this.events = [];
    this.eventFiles = getFiles(path.join(process.cwd(), "src", "events"), ".js");
    this.reloadEvents(false);

    console.log(chalk.greenBright("Events? Registered."));
  }

  reloadEvents() {
    for (const event of this.eventFiles) this.reloadEvent(event, true);
  }

  reloadEvent(name, remEvents) {
    if (remEvents === true) this.removeEvent(name);

    const findEventFile = this.eventFiles.find(eventFile => eventFile === name);
    const eventFile = requireReload(findEventFile);
    const event = new (eventFile.event)(this.client, this.commands, this);
    const clientEvent = this.client.on(eventFile.name, event.run);

    this.events.push({ name: eventFile.name, event: clientEvent });
  }

  removeEvent(name) {
    const findEventFile = this.eventFiles.find(eventFile => eventFile === name);
    const eventFile = requireReload(findEventFile);
    if (eventFile == null) return false;

    this.client.off(eventFile.name, eventFile.event);
    this.events.splice(this.events.indexOf(eventFile), 1);
    return true;
  }
}
