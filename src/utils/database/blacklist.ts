import { getDatabase } from ".";
import { TableDefinition } from "./types";

const tableDefinition: TableDefinition = {
  name: "blacklist",
  definition: {
    guild: "INTEGER",
  },
};

const database = getDatabase(tableDefinition);

const getQuery = database.query("SELECT * FROM blacklist WHERE guild = $1;");
export function get(guildID: string) {
  return getQuery.all(guildID).length == 0;
}

const addQuery = database.query("INSERT INTO blacklist (guild) VALUES (?1);");
export function add(guildID: string) {
  addQuery.run(guildID);
}

const removeQuery = database.query("DELETE FROM blacklist WHERE guild = $1");
export function remove(guildID: string) {
  removeQuery.run(guildID);
}
