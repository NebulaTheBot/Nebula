import { getDatabase } from ".";
import { FieldData, SqlType, TableDefinition, TypeOfDefinition } from "./types";

const tableDefinition = {
  name: "news",
  definition: {
    guildID: "TEXT",
    key: "TEXT",
    value: "TEXT"
  }
} satisfies TableDefinition;

export const newsDefinition = {
  title: "TEXT",
  body: "TEXT",
  author: "TEXT",
  authorPFP: "TEXT",
  createdAt: "TIMESTAMP",
  updatedAt: "TIMESTAMP",
  messageID: "TEXT",
  channelID: "TEXT",
  roleID: "TEXT",
  id: "TEXT"
} satisfies Record<string, FieldData>;

const database = getDatabase(tableDefinition);
const sendQuery = database.query("INSERT INTO news (guildID, key, value) VALUES (?1, ?2, ?3);");
const listAllQuery = database.query("SELECT * FROM news WHERE guildID = $1;");
const getQuery = database.query("SELECT * FROM news WHERE id = $1;");
const deleteQuery = database.query("DELETE FROM news WHERE id = $1");

export function sendNews<K extends keyof typeof newsDefinition>(
  guildID: string,
  key: K,
  value: TypeOfKey<K>
) {
  sendQuery.run(guildID, key, value);
}

export function listAllNews(guildID: string) {
  return listAllQuery.all(guildID) as TypeOfDefinition<typeof tableDefinition>[];
}

export function get<K extends keyof typeof newsDefinition>(id: string): TypeOfKey<K> | null {
  return getQuery.get(id) as TypeOfKey<K>;
}

export function set<K extends keyof typeof newsDefinition>(
  id: string,
  key: K,
  value: TypeOfKey<K>
) {
  deleteQuery.run(id);
  sendQuery.run(id, key, value);
}

export function updateNews(id: string, title: string, body: string) {
  const lastElem = get(id)!;
  deleteQuery.run(id);
  sendQuery.run(lastElem.guildID, key, value);
}

export function deleteNews(id: string) {
  deleteQuery.run(id);
}

// Utility type
type TypeOfKey<T extends keyof typeof newsDefinition> = SqlType<(typeof newsDefinition)[T]>;
