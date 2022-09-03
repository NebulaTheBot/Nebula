const getFiles = require("../utils/getFiles");

module.exports = async client => {
  const commands = [];
  const commandFiles = getFiles("/commands", ".js");

  for (const command of commandFiles) {
    let commandFile = require(command);

    commands[commandFile.name.toLowerCase()] = commandFile;
    commands.push(commandFile);
  };

  for (const guildID of client.guilds.cache.keys()) {
    const guild = client.guilds.cache.get(guildID);
    // guild.commands.set([]);
    await guild.commands.set(commands);
  };
  
  client.on("interactionCreate", interaction => {
    if (!interaction.isChatInputCommand()) return;

    commands[interaction.commandName]
      .callback(interaction)
      .catch(error => console.error(error));
  });
}
