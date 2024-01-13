// TODO: Add more settings
import { getDatabase } from ".";
import { FieldData, SqlType, TableDefinition, TypeOfDefinition } from "./types";

const tableDefinition = {
  name: "settings",
  definition: {
    guild: "INTEGER",
    key: "TEXT",
    value: "TEXT"
  }
} satisfies TableDefinition;

const settingsDefinition = {
  "levelling.enabled": "BOOL",
  "levelling.channel": "INTEGER",
  "levelling.persistence": "BOOL",
  "log.channel": "INTEGER",
  "serverboard.inviteLink": "TEXT",
  "serverboard.shown": "BOOL",
} satisfies Record<string, FieldData>;

export const settingKeys = Object.keys(settingsDefinition) as (keyof typeof settingsDefinition)[];
const database = getDatabase(tableDefinition);
const getQuery = database.query("SELECT * FROM settings WHERE guild = $1 AND key = $2;");
const setQuery = database.query("UPDATE settings SET value = $3 WHERE guild = $1 AND key = $2;");

export function get<K extends keyof typeof settingsDefinition>(guild: string, key: K): TypeOfKey<K> | null {
  let res = getQuery.all(guild, key) as TypeOfDefinition<typeof tableDefinition>[];
  if (res.length == 0) return null;
  if (settingsDefinition[key] == "TEXT") return res[0].value as TypeOfKey<K>;
  return JSON.parse(res[0].value);
}

export function set<K extends keyof typeof settingsDefinition>(guild: string, key: K, value: TypeOfKey<K>) {
  setQuery.run(guild, key, JSON.stringify(value));
}

// Utility type
type TypeOfKey<T extends keyof typeof settingsDefinition> = SqlType<(typeof settingsDefinition)[T]>;
