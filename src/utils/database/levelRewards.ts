// TODO: Implement logic

import { getDatabase } from ".";
import { TableDefinition, TypeOfDefinition } from "./types";

const tableDefinition = {
  name: "levelRewards",
  definition: {
    guild: "INTEGER",
    level: "INTEGER",
    role: "INTEGER",
  },
} satisfies TableDefinition;

const database = getDatabase(tableDefinition);

const getQuery = database.query("SELECT * FROM levelRewards WHERE guild = $1;");
export function get(guildID: string) {
  return getQuery.all(guildID) as TypeOfDefinition<typeof tableDefinition>[];
}

const test = get("");

const addQuery = database.query(
  "INSERT INTO levelRewards (guild, level, role) VALUES (?1, ?2, ?3);",
);
export function add(guildID: string, level: number, role: number) {
  return addQuery.all(guildID, level, role) as TypeOfDefinition<
    typeof tableDefinition
  >[];
}

export function updateLevel(guildID: string, level: number, role: number) {}

export function updateRole(guildID: string, level: number, role: number) {}

export function remove(guildID: string, level: number, role: number) {}
