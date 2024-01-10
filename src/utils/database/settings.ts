// TODO: Add more settings

import { getDatabase } from ".";
import { FieldData, SqlType, TableDefinition, TypeOfDefinition } from "./types";

// Define table structure
const tableDefinition = {
  name: "settings",
  definition: {
    guild: "INTEGER",
    key: "TEXT",
    value: "TEXT",
  },
} satisfies TableDefinition;

// Define type of settings
const settingsDefinition = {
  "leveling.enabled": "BOOL",
  "leveling.channel": "INTEGER",
  "leveling.persistence": "BOOL",
  "log.channel": "INTEGER",
  "serverboard.inviteLink": "TEXT",
  "serverboard.shown": "BOOL",
} satisfies Record<string, FieldData>;

export const settingKeys = Object.keys(
  settingsDefinition,
) as (keyof typeof settingsDefinition)[];

const database = getDatabase(tableDefinition);

const getQuery = database.query(
  "SELECT * FROM settings WHERE guild = $1 AND key = $2;",
);
export function get<K extends keyof typeof settingsDefinition>(
  guild: string,
  key: K,
): TypeOfKey<K> | null {
  let res = getQuery.all(guild, key) as TypeOfDefinition<
    typeof tableDefinition
  >[];
  if (res.length == 0) return null;
  if (settingsDefinition[key] == "TEXT") return res[0].value;
  return JSON.parse(res[0].value);
}

let setQuery = database.query(
  "UPDATE settings SET value = $3 WHERE guild = $1 AND key = $2;",
);
export function set<K extends keyof typeof settingsDefinition>(
  guild: string,
  key: K,
  value: TypeOfKey<K>,
) {
  setQuery.run(guild, key, JSON.stringify(value));
}

// Utility type
type TypeOfKey<T extends keyof typeof settingsDefinition> = SqlType<
  (typeof settingsDefinition)[T]
>;
