const { Client, Intents } = require("discord.js");
const cfg = require("./config.json");
const snoowrap = require("snoowrap");

const client = new Client({
	intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
    ]
});

const r = new snoowrap({
    userAgent: cfg.userAgent,
    clientId: cfg.clientId,
    clientSecret: cfg.clientSecret,
    username: cfg.username,
    password: cfg.password
});


module.exports = {
    client, 
    r
};

client.on("ready", () => {
    const commandHandler = require("./handlers/commands");
    commandHandler(client);

    client.user.setPresence({ activities: [{ name: `everyone! Type e!help for help.`, type: `LISTENING` }] });
	console.log("Start/Restart completed. Bot has been alive'd.");
});
client.login(cfg.tokens["Entity TB"]);
