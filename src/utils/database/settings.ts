// TODO: Add more settings
import { getDatabase } from ".";
import { FieldData, SqlType, TableDefinition, TypeOfDefinition } from "./types";

const tableDefinition = {
  name: "settings",
  definition: {
    guild: "TEXT",
    key: "TEXT",
    value: "TEXT",
  },
} satisfies TableDefinition;

export const settingsDefinition = {
  "levelling.enabled": "BOOL",
  "levelling.channel": "INTEGER",
  "levelling.persistence": "BOOL",
  "log.channel": "INTEGER",
  "serverboard.inviteLink": "TEXT",
  "serverboard.shown": "BOOL",
} satisfies Record<string, FieldData>;

export const settingsKeys = Object.keys(
  settingsDefinition,
) as (keyof typeof settingsDefinition)[];
const database = getDatabase(tableDefinition);

const getQuery = database.query(
  "SELECT * FROM settings WHERE guild = $1 AND key = $2;",
);
const listPublicQuery = database.query(
  "SELECT * FROM settings WHERE key = 'serverboard.shown' AND value = 'TRUE';",
);
const removeQuery = database.query(
  "DELETE FROM settings WHERE guild = $1 AND key = $2;",
);
const insertQuery = database.query(
  "INSERT INTO settings (guild, key, value) VALUES (?1, ?2, ?3);",
);

export function getSetting<K extends keyof typeof settingsDefinition>(
  guild: string,
  key: K,
): TypeOfKey<K> | null {
  let res = getQuery.all(JSON.stringify(guild), key) as TypeOfDefinition<
    typeof tableDefinition
  >[];
  if (res.length == 0) return null;
  switch (settingsDefinition[key]) {
    case "TEXT":
      return res[0].value as TypeOfKey<K>;
    case "BOOL":
      return (res[0].value == "TRUE") as TypeOfKey<K>;
    default:
      // TODO: Implement more data types
      return "WIP";
  }
}

export function setSetting<K extends keyof typeof settingsDefinition>(
  guild: string,
  key: K,
  value: TypeOfKey<K>,
) {
  const doInsert = getSetting(guild, key) == null;
  if (!doInsert) {
    removeQuery.all(JSON.stringify(guild), key);
  }
  insertQuery.run(JSON.stringify(guild), key, value);
}

export function listPublicServers() {
  return (
    listPublicQuery.all() as TypeOfDefinition<typeof tableDefinition>[]
  ).map((entry) => JSON.parse(entry.guild));
}

// Utility type
type TypeOfKey<T extends keyof typeof settingsDefinition> = SqlType<
  (typeof settingsDefinition)[T]
>;
