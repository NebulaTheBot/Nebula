import { getDatabase } from ".";
import { TableDefinition, TypeOfDefinition } from "./types";

const tableDefinition = {
  name: "levelling",
  definition: {
    guild: "TEXT",
    user: "TEXT",
    level: "INTEGER",
    exp: "INTEGER"
  }
} satisfies TableDefinition;

const database = getDatabase(tableDefinition);
const getQuery = database.query("SELECT * FROM levelling WHERE guild = $1 AND user = $2;");
const setQuery = database.query("UPDATE levelling SET level = $3, exp = $4 WHERE guild = $1 AND user = $2;");
const insertQuery = database.query("INSERT INTO levelling (guild, user, level, exp) VALUES (?1, ?2, ?3, ?4);");

export function getLevel(guildID: string, userID: string): [number, number] {
  const res = getQuery.all(guildID, userID) as TypeOfDefinition<typeof tableDefinition>[];
  if (res.length == 0) return [0, 0];
  return [res[0].level, res[0].exp];
}

export function setLevel(guildID: string | number, userID: string, level: number, exp: number) {
  getQuery.all(guildID, userID).length == 0
    ? insertQuery.run(guildID, userID, level, exp)
    : setQuery.run(guildID, userID, level, exp);
}
