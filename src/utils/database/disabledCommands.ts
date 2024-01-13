import { getDatabase } from ".";
import { TableDefinition, TypeOfDefinition } from "./types";

const tableDefinition = {
  name: "disabledCommands",
  definition: {
    guild: "INTEGER",
    command: "TEXT"
  }
} satisfies TableDefinition;

const database = getDatabase(tableDefinition);
const getQuery = database.query("SELECT * FROM disabledCommands WHERE guild = $1;");
const addQuery = database.query("INSERT INTO disabledCommands (guild, command) VALUES (?1, ?2);");
const removeQuery = database.query("DELETE FROM disabledCommands WHERE guild = $1 AND command = $2");

export function getDisabledCommands(guildID: string) {
  return (getQuery.all(guildID) as TypeOfDefinition<typeof tableDefinition>[]).map(val => val.command);
}

export function disableCommands(guildID: string, command: string) {
  addQuery.run(guildID, command);
}

export function enableCommands(guildID: string, command: string) {
  removeQuery.run(guildID, command);
}
