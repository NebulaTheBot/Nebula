const { Colors } = require("discord.js");
const snoowrap = require("snoowrap");
require("dotenv").config();

const r = new snoowrap({
  userAgent: process.env.REDDIT_USER_AGENT,
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD
});

const infoColors = [
  Colors.Blue,
  Colors.DarkBlue,
  Colors.Blurple
];

function clearModule(moduleName) {
  let mp = require.resolve(moduleName);
  if (require.cache[mp]) delete require.cache[mp];
}

function requireReload(moduleName) {
  clearModule(moduleName);
  return require(moduleName);
}

module.exports = { r, infoColors, requireReload };
