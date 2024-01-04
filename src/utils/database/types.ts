export type FieldData =
  | "TEXT"
  | "INTEGER"
  | "FLOAT"
  | "BOOL"
  | "TIMESTAMP"
  | "JSON";

export const tableDefinition = {
  leveling: {
    guild: "TEXT",
    user: "TEXT",
    levels: "INTEGER",
    exp: "INTEGER",
  },
  moderation: {
    guild: "TEXT",
    user: "TEXT",
    type: "TEXT",
    reason: "TEXT",
    moderator: "TEXT",
    public: "BOOL",
  },
  news: {
    guild: "TEXT",
    title: "TEXT",
    body: "TEXT",
    imageURL: "TEXT",
    author: "TEXT",
    authorPFP: "TEXT",
    createdAt: "TIMESTAMP",
    updatedAt: "TIMESTAMP",
    messageID: "TEXT",
  },
  serverboard: {
    guild: "TEXT",
    shown: "BOOL",
    invite: "TEXT",
  },
  settings: {
    guild: "TEXT",
    key: "TEXT",
    value: "TEXT",
  },
} satisfies Record<string, Record<string, FieldData>>;
