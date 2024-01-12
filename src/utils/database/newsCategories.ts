// TODO:
import { getDatabase } from ".";
import { TableDefinition, TypeOfDefinition } from "./types";

const definition = {
  name: "newsCategories",
  definition: {
    guild: "INTEGER",
    name: "TEXT",
    role: "INTEGER",
    channel: "INTEGER",
    id: "TEXT",
  },
} satisfies TableDefinition;

const database = getDatabase(definition);

const createQuery = database.query(
  "INSERT INTO newsCategories (guild, name, role, channel, id) VALUES (?1, ?2, ?3, ?4, ?5);",
);
export function createCategory(
  guildID: number | string,
  name: string,
  role: number | string,
  channel: number | string,
) {
  createQuery.run(guildID, name, role, channel, crypto.randomUUID());
}

const listQuery = database.query(
  "SELECT * FROM newsCategories WHERE guild = $1;",
);
export function listCategories(guildID: number | string) {
  return listQuery.all(guildID) as TypeOfDefinition<typeof definition>[];
}

const findNameQuery = database.query(
  "SELECT * FROM newsCategories WHERE guild = $1 AND name = $2;",
);
export function findWithName(guildID: number | string, name: string) {
  return findNameQuery.get(guildID, name) as TypeOfDefinition<
    typeof definition
  >[];
}

const updateQuery = database.query(
  "UPDATE newsCategories SET name = $3 WHERE guild = $1 AND name = $2",
);
export function updateCategory(
  guildID: number | string,
  name: string,
  newName: string,
) {
  updateQuery.run(guildID, name, newName);
}

const deleteQuery = database.query(
  "DELETE FROM newsCategories WHERE guild = $1 AND name = $2",
);
export function deleteCategory(guildID: number | string, name: string) {
  deleteQuery.run(guildID, name);
}
