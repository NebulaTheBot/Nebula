// TODO: 

import {getDatabase} from ".";
import {TableDefinition} from "./types";

const definition: TableDefinition = {
  name: "levelRewards",
  definition: {
    guild: "INTEGER",
    level: "INTEGER",
    role: "INTEGER",
  },
};

const database = getDatabase(definition);
