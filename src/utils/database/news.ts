// TODO: 

import {getDatabase} from ".";
import {TableDefinition} from "./types";

const definition: TableDefinition = {
  name: "news",
  definition: {
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
};

const database = getDatabase(definition);
