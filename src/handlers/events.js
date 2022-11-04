const { getFiles, requireReload } = require("../utils/misc");
const path = require("path");
const chalk = require("chalk");
const AsciiTable = require("ascii-table");

module.exports = class Events {
  constructor(client, commands) {
    this.client = client;
    this.commands = commands;
    this.events = [];
    this.eventFiles = getFiles(path.join(process.cwd(), "src", "events"), ".js");
    this.table = new AsciiTable()
      .setHeading("Events", "State")
      .setBorder("|", "-", "0", "0");

    this.reloadEvents(false);
    console.log(chalk.red(this.table.toString()));
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
    this.table.addRow(eventFile.name, "✅");
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
