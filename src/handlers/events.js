const getFiles = require("../utils/getFiles");
const { requireReload } = require("../constants");
const path = require("path");
const chalk = require("chalk");
const AsciiTable = require("ascii-table");

const table = new AsciiTable()
  .setHeading("Events", "State")
  .setBorder("|", "-", "0", "0");

class Events {
  events = [];
  commands = [];
  client = null;
  eventFiles = getFiles(path.join(process.cwd(), "src", "events"), ".js");

  constructor(client, commands) {
    this.client = client;
    this.commands = commands;
    this.reloadEvents();
    for (const event of this.events) table.addRow(event.name, "✅");

    console.log(chalk.red(table.toString()));
    console.log(chalk.greenBright("Events? Registered."));
  }
  
  reloadEvents = () => {
    for (const event of this.eventFiles) this.reloadEvent(event);
  }

  reloadEvent = name => {
    this.removeEvent(name);

    const findEventFile = this.eventFiles.find(eventFile => eventFile === name);
    const eventFile = requireReload(findEventFile);
    let event = new (eventFile.event)(this.client, this.commands, this);
    let clientEvent = this.client.on(eventFile.name, event.run);
    
    this.events.push({ name: eventFile.name, event: clientEvent });
  }

  removeEvent = name => {
    const findEventFile = this.eventFiles.find(eventFile => eventFile === name);
    const eventFile = requireReload(findEventFile);
    if (eventFile == null) return false;

    this.client.off(eventFile.name, eventFile.event);
    this.events.splice(this.events.indexOf(eventFile), 1);
    return true;
  }
}

module.exports = Events;
