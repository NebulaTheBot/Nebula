import { getDatabase } from ".";
import { TableDefinition, TypeOfDefinition } from "./types";

const tableDefinition = {
  name: "levelBlockedChannels",
  definition: {
    guild: "INTEGER",
    channel: "INTEGER",
  },
} satisfies TableDefinition;

const database = getDatabase(tableDefinition);

const getQuery = database.query(
  "SELECT * FROM levelBlockedChannels WHERE guild = $1 AND channel = $2;",
);
export function getBlockedChannels(guildID: string, channelID: string) {
  return getQuery.all(guildID, channelID).length == 0;
}

const listQuery = database.query("SELECT * FROM levelBlockedChannels WHERE guild = $1;");
export function listBlockedChannels(guildID: string) {
  return (
    listQuery.all(guildID) as TypeOfDefinition<typeof tableDefinition>[]
  ).map((val) => val.channel);
}

const addQuery = database.query(
  "INSERT INTO levelBlockedChannels (guild, channel) VALUES (?1, ?2);",
);
export function blockChannel(guildID: string, channelID: string) {
  addQuery.run(guildID, channelID);
}

const removeQuery = database.query(
  "DELETE FROM levelBlockedChannels WHERE guild = $1 AND channel = $2;",
);
export function unblockChannel(guildID: string, channelID: string) {
  removeQuery.run(guildID, channelID);
}
