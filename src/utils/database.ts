import { QuickDB, MySQLDriver } from "quick.db";

export async function database() {
  const mysql = new MySQLDriver({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    port: parseInt(process.env.MYSQL_PORT),
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    enableKeepAlive: true,
    compress: true
  });

  await mysql.connect();
  const db = new QuickDB({ driver: mysql });
  return db;
}

export const getSettingsTable = async (db: QuickDB<any>) => await db.tableAsync("settings");
export const getLevelingTable = async (db: QuickDB<any>) => await db.tableAsync("leveling");
export const getServerboardTable = async (db: QuickDB<any>) => await db.tableAsync("serverboard");
export const getNewsTable = async (db: QuickDB<any>) => await db.tableAsync("news");
export const getModerationTable = async (db: QuickDB<any>) => await db.tableAsync("moderation");
