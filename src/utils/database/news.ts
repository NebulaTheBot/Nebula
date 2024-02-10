import { getDatabase } from ".";
import { TableDefinition, TypeOfDefinition } from "./types";

const definition = {
  name: "news",
  definition: {
    guildID: "TEXT",
    title: "TEXT",
    body: "TEXT",
    imageURL: "TEXT",
    author: "TEXT",
    authorPFP: "TEXT",
    createdAt: "TIMESTAMP",
    updatedAt: "TIMESTAMP",
    messageID: "TEXT",
    channelID: "TEXT",
    roleID: "TEXT",
    id: "TEXT"
  }
} satisfies TableDefinition;

const database = getDatabase(definition);
const sendQuery = database.query(
  "INSERT INTO news (guildID, title, body, imageURL, author, authorPFP, createdAt, updatedAt, messageID, channelID, roleID, id) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12);"
);
const listAllQuery = database.query("SELECT * FROM news WHERE guildID = $1;");
const getIdQuery = database.query("SELECT * FROM news WHERE id = $1;");
const deleteQuery = database.query("DELETE FROM news WHERE id = $1");

export function sendNews(
  guildID: string,
  title: string,
  body: string,
  imageURL: string | null,
  author: string,
  authorPFP: string,
  messageID: string,
  channelID: string,
  roleID: string
) {
  sendQuery.run(
    guildID,
    title,
    body,
    imageURL,
    author,
    authorPFP,
    Date.now(),
    0,
    messageID,
    channelID,
    roleID,
    crypto.randomUUID()
  );
}

export function listAllNews(guildID: string) {
  return listAllQuery.all(guildID) as TypeOfDefinition<typeof definition>[];
}

export function get(id: string) {
  return getIdQuery.get(id) as TypeOfDefinition<typeof definition> | null;
}

export function updateNews(id: string, title: string, body: string, imageURL: string | null) {
  const lastElem = get(id)!;
  deleteQuery.run(id);
  sendQuery.run(
    lastElem.guildID,
    title,
    body,
    imageURL,
    lastElem.author,
    lastElem.authorPFP,
    Date.now(),
    0,
    lastElem.messageID,
    lastElem.channelID,
    lastElem.roleID,
    id
  );
}

export function deleteNews(id: string) {
  deleteQuery.run(id);
}
