import { getDatabase } from ".";
import { TableDefinition, TypeOfDefinition } from "./types";

const tableDefinition = {
  name: "polls",
  definition: {
    guild: "TEXT",
    message: "TEXT"
  }
} satisfies TableDefinition;

const database = getDatabase(tableDefinition);
const getQuery = database.query("SELECT * FROM polls WHERE guild = $1;");
const addQuery = database.query("INSERT INTO polls (guild, message) VALUES (?1, ?2);");
const removeQuery = database.query("DELETE FROM polls WHERE guild = $1 AND message = $2");

export function getPolls(guildID: string) {
  return (getQuery.all(guildID) as TypeOfDefinition<typeof tableDefinition>[]).map(
    val => val.message
  );
}

export function addPoll(guildID: string, message: string) {
  addQuery.run(guildID, message);
}

export function removePoll(guildID: string, message: string) {
  removeQuery.run(guildID, message);
}
