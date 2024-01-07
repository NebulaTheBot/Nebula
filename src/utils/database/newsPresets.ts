// TODO: 

import {getDatabase} from ".";
import {TableDefinition} from "./types";

const definition: TableDefinition = {
  name: "newsPresets",
  definition: {
    guild: "INTEGER",
    value: "TEXT",
    name: "TEXT",
    role: "INTEGER",
    channel: "INTEGER",
  },
};

const database = getDatabase(definition);
