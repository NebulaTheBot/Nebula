const getFiles = require("../utils/getFiles");
const path = require("path");

class Events {
  events = [];
  commands = [];
  client = null;
  eventFiles = getFiles(path.join(process.cwd(), "src", "events"), ".js");

  constructor(client, commands) {
    this.client = client;
    this.commands = commands;
    this.reloadEvents();
  }
  
  reloadEvents = () => {
    for (const event of this.eventFiles) this.reloadEvent(event);
  }

  reloadEvent = name => {
    this.removeEvent(name);

    const findEventFile = this.eventFiles.find(eventFile => eventFile === name);
    const eventRequire = require(findEventFile);

    const Event = eventRequire.event;
    let event = new Event(this.client, this.commands, this.events);
    let clientEvent = this.client.on(eventRequire.name, event.run);
    
    this.events.push({ name: eventRequire.name, event: clientEvent });
  }

  removeEvents = () => this.client.off(this.events);

  removeEvent = name => {
    const event = this.eventFiles.find(eventFile => eventFile.name === name);
    if (event == null) return false;

    this.client.off(event.event);
    this.events.splice(this.events.indexOf(event), 1);
    return true;
  }
}

module.exports = Events;
