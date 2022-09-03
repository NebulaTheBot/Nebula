const getFiles = require("../utils/getFiles");

module.exports = async client => {
  const events = [];
  const eventFiles = getFiles("/events", ".js");

  for (const event of eventFiles) {
    let eventFile = require(event);

    events[eventFile.name.toLowerCase()] = eventFile;
    events.push(eventFile);
  };
  
  client.on("interactionCreate", interaction => {
    if (!interaction.isChatInputCommand()) return;

    commands[interaction.commandName]
      .callback(interaction)
      .catch(error => console.error(error));
  });
}
