import { getDatabase } from ".";
import { TableDefinition } from "./types";

const definition: TableDefinition = {
  name: "blacklist",
  definition: {
    guild: "TEXT",
  },
};

const database = getDatabase(definition);

const findQuery = database.query("SELECT * FROM blacklist WHERE guild = $1;");
export function validate(guildID: string) {
  return findQuery.all(guildID).length == 0;
}

const addQuery = database.query("INSERT INTO blacklist (guild) VALUES (?1);");
export function add(guildID: string) {
  addQuery.run(guildID);
}

const removeQuery = database.query("DELETE FROM blacklist WHERE guild = $1");
export function remove(guildID: string) {
  removeQuery.run(guildID);
}
