import { database } from ".";
import { FieldData } from "./types";

// Define type of settings
const settingsDefinition = {
  "leveling.enabled": "BOOL",
  "leveling.channel": "TEXT",
  "leveling.reward": "JSON",
} satisfies Record<string, FieldData>;

const getQuery = database.query(
  "SELECT * FROM settings WHERE guild = $1 AND key = $2;",
);
export function get(
  guild: string,
  key: keyof typeof settingsDefinition,
): ValueOfSetting<typeof key> | null {
  let res = getQuery.all(guild, key) as string[];
  if (res.length == 0) return null;
  if (settingsDefinition[key] == "TEXT") return res[0];
  return JSON.parse(res[0]);
}

let setQuery = database.query(
  "UPDATE settings SET value = $3 WHERE guild = $1 AND key = $2;",
);
export function set(
  guild: string,
  key: keyof typeof settingsDefinition,
  value: ValueOfSetting<typeof key>,
) {
  setQuery.run(guild, key, JSON.stringify(value));
}

// Utility type
type ValueOfSetting<T extends keyof typeof settingsDefinition> =
  (typeof settingsDefinition)[T] extends "BOOL"
    ? boolean
    : T extends "INTEGER" | "FLOAT"
      ? number
      : T extends "TEXT"
        ? string
        : T extends "TIMESTAMP"
          ? Date
          : T extends "JSON"
            ? any
            : never;
