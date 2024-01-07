// TODO:

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
  "SELECT * FROM blacklist WHERE guild = $1 AND user = $2;",
);
export function get(guildID: string, userID: string) {
  const res = getQuery.all(guildID, userID) as TypeOfDefinition<
    typeof tableDefinition
  >[];
  if (res.length == 0) return { level: 0, exp: 0 };
  return { level: res[0].level, exp: res[0].exp };
}

const setQuery = database.query("");
const insertQuery = database.query("");
export function set(
  guildID: string,
  userID: string,
  level: number,
  exp: number,
) {
  getQuery.all(guildID, userID).length == 0
    ? insertQuery.run(guildID, userID, level, exp)
    : setQuery.run(guildID, userID, level, exp);
}
