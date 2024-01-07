// TODO:

import {getDatabase} from ".";
import {TableDefinition} from "./types";

const definition: TableDefinition = {
  name: "leveling",
  definition: {
    guild: "INTEGER",
    user: "INTEGER",
    levels: "INTEGER",
    exp: "INTEGER",
  },
};

const database = getDatabase(definition);

export function set() {}

export function get() {}
