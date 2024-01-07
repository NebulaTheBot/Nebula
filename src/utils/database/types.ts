export type FieldData =
  | "TEXT"
  | "INTEGER"
  | "FLOAT"
  | "BOOL"
  | "TIMESTAMP"
  | "JSON";

export type TableDefinition = {
  name: string;
  definition: Record<string, FieldData>;
};

// TODO: Remove table definition
export const tableDefinition2 = {
  blacklist: {
    guild: "INTEGER",
  },
  leveling: {
    guild: "INTEGER",
    user: "INTEGER",
    levels: "INTEGER",
    exp: "INTEGER",
  },
  levelRewards: {
    guild: "INTEGER",
    level: "INTEGER",
    role: "INTEGER",
  },
  levelBlockedChannels: {
    guild: "INTEGER",
    channel: "INTEGER",
  },
  moderation: {

  },
  news: {
    guild: "INTEGER",
    id: "TEXT",
    title: "TEXT",
    body: "TEXT",
    imageURL: "TEXT",
    author: "TEXT",
    authorPFP: "TEXT",
    createdAt: "TIMESTAMP",
    updatedAt: "TIMESTAMP",
    messageID: "INTEGER",
  },
  newsPresets: {
    guild: "INTEGER",
    value: "TEXT",
    name: "TEXT",
    role: "INTEGER",
    channel: "INTEGER",
  },
  serverboard: {
    guild: "INTEGER",
    shown: "BOOL",
    invite: "TEXT",
  },
  settings: {},
} satisfies Record<string, Record<string, FieldData>>;
