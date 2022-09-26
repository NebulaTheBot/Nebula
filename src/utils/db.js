const mysql = require("promise-mysql");

const escapeRegex = (value) => {
  if (typeof value !== "string") return value;
  return value.replace(/[.*+?^"'${}()|[\]\\]/g, '\\$&');
}

async function getConn() {
  return await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
    port: 3306,
  });
}

async function del(ID = "", TABLE = "", ID_name = "ID") {
  const db = await getConn();
  if (TABLE === "") return;

  // Querying the database
  let query = `DELETE FROM \`${TABLE}\` WHERE \`${ID_name}\` = '${ID}'`;
  await db.query(query).catch((error) => console.error(error));
  db.end();
}

async function update(ID = "", TABLE = "", value = {}, ID_name = "ID") {
  const db = await getConn();
  if (TABLE === "") return;

  // Creating the query
  let query = `UPDATE \`${TABLE}\` SET `;
  for (let key in value) {
    if (typeof value[key] === "object") value[key] = JSON.stringify(value[key]);
    query += `\`${escapeRegex(key)}\`="${escapeRegex(value[key])}",`;
  }
  query = query.slice(0, query.length - 1) + ` WHERE \`${ID_name}\` = '${ID}'`;

  // Executing the query
  await db.query(query).catch((error) => console.error(error));
  db.end();
}

async function insert(TABLE = "", value = {}) {
  const db = await getConn();
  if (TABLE === "") return;

  // Creating the query
  let query = `INSERT INTO \`${TABLE}\` (`; // INITIALISATION
  for (let key in value) query += `\`${escapeRegex(key)}\`, `; // Add the keys
  query = query.slice(0, query.length - 2) + ") VALUES ("; // Add VALUES to query

  for (let key in value) {
    if (typeof value[key] === "object") value[key] = JSON.stringify(value[key]);
    query += `"${escapeRegex(value[key])}", `; // Add the value
  }
  query = query.slice(0, query.length - 2) + ")"; // End of Query

  await db.query(query).catch((error) => console.error(error));
  db.end();
}

async function get(ID = "", TABLE = "", ID_name = "ID") {
  // console.time("GET TIME");
  const db = await getConn();
  let result = { TABLE, ID };
  if (TABLE === "") return;

  // Querying the database and setting result
  let query = `SELECT * FROM \`${TABLE}\` WHERE \`${ID_name}\` = '${ID}'`;
  let response = await db.query(query).catch((error) => console.error(error));
  if (response == null) return null;
  if (response !== []) response = response[0];
  result = { ...result, ...response };

  db.end();
  // console.timeEnd("GET TIME");
  // console.log("---");
  return result;
}

async function getTables() {
  const db = await getConn();
  let result = [];
  const query = "SELECT table_name FROM information_schema.tables WHERE table_type = 'base table'";
  const response = await db.query(query).catch((error) => console.error(error));
  for (let i = 0; i < response.length; i++) result.push(response[i].table_name);

  db.end();
  return result;
}

async function getBulk(TABLE = "") {
  // console.time("GETBULK TIME");
  const db = await getConn();
  let result = [{ TABLE, ID: "" }];
  if (TABLE == "") return;

  let query = `SELECT * FROM \`${TABLE}\``;
  let response = await db.query(query).catch((error) => console.error(error));
  result = [];
  for (let i = 0; i < response?.length; i++) result.push({ TABLE, ...response[i] });

  db.end();
  // console.timeEnd("GETBULK TIME");
  // console.log("---");
  return result;
}

module.exports = { get, insert, update, getBulk, del, getTables };
