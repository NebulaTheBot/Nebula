import { Database } from "bun:sqlite";
import { TableDefinition } from "./types";

// Get (or create) an SQLite database
const database = new Database("data.db", { create: true });

export function getDatabase(definition: TableDefinition) {
  // Create table if it doesn't exist
  const defStr = Object.entries(definition.definition)
    .map(([field, type]) => field.concat(" ", type))
    .join(", ");
  database.run(`CREATE TABLE IF NOT EXISTS ${definition.name} (${defStr});`);
  return database;
}
