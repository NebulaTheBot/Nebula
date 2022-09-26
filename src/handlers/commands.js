const getFiles = require("../utils/getFiles");
const path = require("path");

class Commands {
  commands = [];
  client = null;
  
  constructor(client) {
    this.client = client;
    this.reloadCommands();
  }
  
  reloadCommands = async () => {
    const commandFiles = getFiles(path.join(process.cwd(), "src", "commands"), ".js");
  
    for (const command of commandFiles) {
      this.removeCommand(command.name);

      let commandFile = require(command);
      const commandOptions = commandFile.options[0];
      if (commandOptions?.name == null) continue;

      this.commands.push(commandOptions);
    };

    for (const guildID of this.client.guilds.cache.keys()) {
      const guild = this.client.guilds.cache.get(guildID);
      await guild.commands.set(this.commands).catch(() => {});
    };
  }

  removeCommand = async () => {
    for (const guildID of this.client.guilds.cache.keys()) {
      const guild = this.client.guilds.cache.get(guildID);
      await guild.commands.delete(this.commands).catch(() => {});
    };
  }
}

module.exports = Commands;
