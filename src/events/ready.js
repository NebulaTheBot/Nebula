const Commands = require("../handlers/commands");

class Ready {
  client = null; 

  constructor(client) {
    this.client = client;
  }
  
  commands = () => (new Commands(this.client)).commands;
  run = () => console.log("Start completed. Bot has been alive'd.");
}

module.exports = { name: "ready", event: ready };
exports.ready = Ready;
