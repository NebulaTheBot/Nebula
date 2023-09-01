import { ShardingManager } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const manager = new ShardingManager("./dist/bot.js", { token: process.env.TOKEN });

manager.on("shardCreate", shard => {
  shard.on("error", err => console.error(err));
  console.log(`Launched shard ${shard.id}`);
});

manager.spawn();
