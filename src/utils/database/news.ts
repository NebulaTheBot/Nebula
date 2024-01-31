import { getDatabase } from ".";
import { TableDefinition, TypeOfDefinition } from "./types";

const definition = {
  name: "news",
  definition: {
    guild: "TEXT",
    title: "TEXT",
    body: "TEXT",
    imageURL: "TEXT",
    author: "TEXT",
    authorPFP: "TEXT",
    createdAt: "TIMESTAMP",
    updatedAt: "TIMESTAMP",
    messageID: "TEXT",
    id: "TEXT"
  }
} satisfies TableDefinition;

const database = getDatabase(definition);
const addQuery = database.query(
  "INSERT INTO news (guild, title, body, imageURL, author, authorPFP, createdAt, updatedAt, messageID, id) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11);"
);
const listAllQuery = database.query("SELECT * FROM news WHERE guild = $1;");
const getIdQuery = database.query("SELECT * FROM news WHERE id = $1;");
const updateQuery = database.query(
  "UPDATE news SET title = $2, body = $3, imageURL = $4 WHERE id = $1"
);
const deleteQuery = database.query("DELETE FROM news WHERE id = $1");

export function addNews(
  guildID: number | string,
  title: string,
  body: string,
  imageURL: string | null,
  author: string,
  authorPFP: string,
  messageID: string | number
) {
  addQuery.run(
    guildID,
    title,
    body,
    imageURL,
    author,
    authorPFP,
    Date.now(),
    0,
    messageID,
    crypto.randomUUID()
  );
}

export function listAllNews(guildID: string) {
  return listAllQuery.all(guildID) as TypeOfDefinition<typeof definition>[];
}

export function get(id: string) {
  return getIdQuery.get(id) as TypeOfDefinition<typeof definition> | null;
}

export function updateNews(id: string, title: string, body: string, imageURL: string) {
  const lastElem = deleteQuery.get(id) as TypeOfDefinition<typeof definition>;
  addQuery.run(
    lastElem.guild,
    title,
    body,
    imageURL,
    lastElem.author,
    lastElem.authorPFP,
    Date.now(),
    0,
    lastElem.messageID,
    id
  );
  updateQuery.run(id, title, body, imageURL);
}

export function deleteNews(id: string) {
  deleteQuery.run(id);
}
