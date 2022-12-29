const { ShardingManager } = require("discord.js");
const chalk = require("chalk");
require("dotenv").config();

const manager = new ShardingManager("./src/bot.js", { token: process.env.TOKEN });

manager.on("shardCreate", shard => console.log(chalk.blueBright(`Launched shard ${shard.id}`)));
manager.spawn();
