import { getDatabase } from ".";
import { TableDefinition } from "./types";

const tableDefinition: TableDefinition = {
  name: "levelBlockedChannels",
  definition: {
    guild: "INTEGER",
    channel: "INTEGER",
  },
};

const database = getDatabase(tableDefinition);

const getQuery = database.query(
  "SELECT * FROM blacklist WHERE guild = $1 AND channel = $2;",
);
export function get(guildID: string, channelID: string) {
  return getQuery.all(guildID, channelID).length == 0;
}

const addQuery = database.query(
  "INSERT INTO blacklist (guild, channel) VALUES (?1, ?2);",
);
export function add(guildID: string, channelID: string) {
  addQuery.run(guildID, channelID);
}

const removeQuery = database.query(
  "DELETE FROM blacklist WHERE guild = $1 AND channel = $2;",
);
export function remove(guildID: string, channelID: string) {
  removeQuery.run(guildID, channelID);
}
