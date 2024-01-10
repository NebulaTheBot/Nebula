import { getDatabase } from ".";
import { TableDefinition, TypeOfDefinition } from "./types";

const tableDefinition = {
  name: "leveling",
  definition: {
    guild: "INTEGER",
    user: "INTEGER",
    level: "INTEGER",
    exp: "INTEGER",
  },
} satisfies TableDefinition;

const database = getDatabase(tableDefinition);

const getQuery = database.query(
  "SELECT * FROM leveling WHERE guild = $1 AND user = $2;",
);
export function get(guildID: string, userID: string): [number, number] {
  const res = getQuery.all(guildID, userID) as TypeOfDefinition<
    typeof tableDefinition
  >[];
  if (res.length == 0) return [0, 0];
  return [res[0].level, res[0].exp];
}

const setQuery = database.query("UPDATE leveling SET level = $3, exp = $4 WHERE guild = $1 AND user = $2;");
const insertQuery = database.query("INSERT INTO leveling (guild, user, level, exp) VALUES (?1, ?2, ?3, ?4);");
export function set(
  guildID: string | number,
  userID: string,
  level: number,
  exp: number,
) {
  getQuery.all(guildID, userID).length == 0
    ? insertQuery.run(guildID, userID, level, exp)
    : setQuery.run(guildID, userID, level, exp);
}
