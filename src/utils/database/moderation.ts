import { getDatabase } from ".";
import { TableDefinition, TypeOfDefinition } from "./types";

const definition = {
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
} satisfies TableDefinition;

type modType = "MUTE" | "WARN" | "KICK" | "BAN";

const database = getDatabase(definition);

const addQuery = database.query(
  "INSERT INTO moderation (guild, user, type, moderator, reason, public, id, timestamp) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8);",
);
export function addModeration(
  guildID: string | number,
  userID: string,
  type: modType,
  moderator: string,
  reason = "",
  pub = false,
) {
  const id = crypto.randomUUID();
  addQuery.run(guildID, userID, type, moderator, reason, pub, id, Date.now());
  return id;
}

const listUserQuery = database.query(
  "SELECT * FROM moderation WHERE guild = $1 AND user = $2 AND type = $3;",
);
export function listUserModeration(
  guildID: number | string,
  userID: number | string,
  type: modType,
) {
  return listUserQuery.all(guildID, userID, type) as TypeOfDefinition<
    typeof definition
  >[];
}

const listModQuery = database.query(
  "SELECT * FROM moderation WHERE guild = $1 AND moderator = $2;",
);
export function listModeratorLog(
  guildID: number | string,
  moderator: number | string,
) {
  return listModQuery.all(guildID, moderator) as TypeOfDefinition<
    typeof definition
  >[];
}

const removeQuery = database.query(
  "DELETE FROM moderation WHERE guild = $1 AND id = $2",
);
export function removeModeration(guildID: string | number, id: string) {
  removeQuery.run(guildID, id);
}
