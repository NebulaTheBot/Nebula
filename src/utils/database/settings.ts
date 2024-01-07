// TODO: Add more settings

import { getDatabase } from ".";
import { FieldData, TableDefinition } from "./types";

// Define table structure
const tableDefinition: TableDefinition = {
  name: "settings",
  definition: {
    guild: "INTEGER",
    key: "TEXT",
    value: "TEXT",
  },
};

// Define type of settings
const settingsDefinition = {
  "custometics.pingedGif": "BOOL",
  "leveling.enabled": "BOOL",
  "leveling.channel": "INTEGER",
  "log.channel": "INTEGER",
  "serverboard.inviteLink": "TEXT",
  "serverboard.shown": "BOOL",
} satisfies Record<string, FieldData>;

const database = getDatabase(tableDefinition);

const getQuery = database.query(
  "SELECT * FROM settings WHERE guild = $1 AND key = $2;",
);
export function get(
  guild: string,
  key: keyof typeof settingsDefinition,
): TypeOfKey<typeof key> | null {
  let res = getQuery.all(guild, key) as string[];
  if (res.length == 0) return null;
  if (settingsDefinition[key] == "TEXT") return res[0] as string;
  return JSON.parse(res[0]);
}

let setQuery = database.query(
  "UPDATE settings SET value = $3 WHERE guild = $1 AND key = $2;",
);
export function set(
  guild: string,
  key: keyof typeof settingsDefinition,
  value: TypeOfKey<typeof key>,
) {
  setQuery.run(guild, key, JSON.stringify(value));
}

// Utility type
type TypeOfKey<T extends keyof typeof settingsDefinition> = {
  BOOL: boolean;
  INTEGER: number;
  FLOAT: number;
  TEXT: string;
  TIMESTAMP: Date;
}[(typeof settingsDefinition)[T]];
