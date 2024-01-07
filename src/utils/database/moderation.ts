// TODO: add remove function, made find work

import { getDatabase } from ".";
import { TableDefinition } from "./types";

const definition: TableDefinition = {
  name: "moderation",
  definition: {
    guild: "INTEGER",
    user: "INTEGER",
    type: "TEXT",
    moderator: "INTEGER",
    reason: "TEXT",
    public: "BOOL",
    id: "TEXT",
    timestamp: "TIMESTAMP",
  },
};

type modType = "WARN" | "KICK" | "BAN";

const database = getDatabase(definition);

const addQuery = database.query(
  "INSERT INTO moderation (guild, user, type, moderator, reason, public, id, timestamp) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8);",
);
export function add(
  guildID: string,
  userID: string,
  type: modType,
  moderator: string,
  reason = "",
  pub = false,
) {
  const id = crypto.randomUUID();
  addQuery.run(guildID, userID, type, moderator, reason, pub, id, Date.now());
}
