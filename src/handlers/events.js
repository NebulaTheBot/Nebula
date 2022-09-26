const getFiles = require("../utils/getFiles");
const path = require("path");

class Events {
  events = [];
  client = null;

  constructor(client) {
    this.client = client;
    this.reloadEvents();
  }
  
  reloadEvents = () => {
    const eventFiles = getFiles(path.join(process.cwd(), "src", "events"), ".js");

    for (const event of eventFiles) this.reloadEvent(event);
  }

  reloadEvent = name => {
    const eventFiles = getFiles(path.join(process.cwd(), "src", "events"), ".js");
    this.removeEvent(name);

    const eventFilePath = eventFiles.find(eventFile => eventFile.name == name);
    const event = require(event);
    const Event = eventRequire.event;
    let eventFile = new Event(this.client);
    let clientEvent = this.client.on(eventRequire.name, eventFile.run);
    
    this.events.push({ name: eventRequire.name, event: clientEvent });
  }

  removeEvent = name => {
    const event = this.events.find(event => event.name === name);
    if (event == null) return false;

    this.client.off(event.event);
    this.events.splice(this.events.indexOf(event), 1);
    return true;
  }
}

module.exports = Events;
