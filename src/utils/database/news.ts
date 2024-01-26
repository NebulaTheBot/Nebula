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
    categoryID: "TEXT",
    id: "TEXT"
  }
} satisfies TableDefinition;

const database = getDatabase(definition);
const addQuery = database.query(
  "INSERT INTO news (guild, title, body, imageURL, author, authorPFP, createdAt, updatedAt, messageID, categoryID, id) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11);"
);
const listAllQuery = database.query("SELECT * FROM news WHERE guild = $1;");
const listCategoryQuery = database.query(
  "SELECT * FROM news WHERE guild = $1 AND categoryID = $2;"
);
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
  messageID: string | number,
  categoryID: string
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
    categoryID,
    crypto.randomUUID()
  );
}

export function listAllNews(guildID: string | number) {
  return listAllQuery.all(guildID) as TypeOfDefinition<typeof definition>[];
}

export function listCategoryNews(guildID: string | number, categoryID: string) {
  return listCategoryQuery.all(guildID, categoryID) as TypeOfDefinition<typeof definition>[];
}

export function updateNews(id: string, title: string, body: string, imageURL: string) {
  updateQuery.run(id, title, body, imageURL);
}

export function deleteNews(id: string) {
  deleteQuery.run(id);
}
