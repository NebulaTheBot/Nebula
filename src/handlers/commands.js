const getFiles = require("../utils/getFiles");
const path = require("path");

class Commands {
  commands = [];
  client = null;
  commandFiles = getFiles(path.join(process.cwd(), "src", "commands"), ".js");
  
  constructor(client) {
    this.client = client;
    this.reloadCommands();
  }
  
  reloadCommands = async () => {  
    for (const command of this.commandFiles) this.reloadCommand(command);

    for (const guildID of this.client.guilds.cache.keys()) {
      const guild = this.client.guilds.cache.get(guildID);
      await guild.commands.set(this.commands).catch(() => {});
    };
  }

  reloadCommand = name => {
    this.removeCommand(name);

    const findCommandFile = this.commandFiles.find(commandFile => commandFile === name);
    const commandFile = require(findCommandFile);
    const commandOptions = commandFile?.options[0];
    if (!commandOptions) return;

    this.commands[commandOptions.name.toLowerCase()] = commandFile;
    this.commands.push(commandFile);
  }

  removeCommands = async () => {
    for (const guildID of this.client.guilds.cache.keys()) {
      const guild = this.client.guilds.cache.get(guildID);
      await guild.commands.delete(this.commands).catch(() => {});
    };
  }

  removeCommand = async name => {
    const command = this.commandFiles.find(commandFile => commandFile.name === name);
    if (command == null) return false;

    for (const guildID of this.client.guilds.cache.keys()) {
      const guild = this.client.guilds.cache.get(guildID);
      await guild.commands.delete(command).catch(() => {});
    };
    return true;
  }
}

module.exports = Commands;
