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
