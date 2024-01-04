import { Database } from "bun:sqlite";
import { tableDefinition } from "./types";

// Get (or create) SQLite database
export const database = new Database("data.db", { create: true });

// Create tables if not exist
for (let [tableNames, definitions] of Object.entries(tableDefinition)) {
  const defStr = Object.entries(definitions)
    .map((field) => Object.entries(field).join(" "))
    .join(", ");
  database.run(`CREATE TABLE IF NOT EXISTS ${tableNames} (${defStr});`);
}
