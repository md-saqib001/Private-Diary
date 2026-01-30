import "dotenv/config";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import fs from "fs";

const dataDir = process.env.DB_DIR || "database";

export const dbPath = process.env.DB_PATH ?? path.join(dataDir, "diary.db");

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log(`📁 Created database directory at: ${dbDir}`);
}

export const openDB = async () => {
    try {
        return await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });
    } catch (err) {
        console.error("❌ Failed to open database:", err);
        throw err;
    }
};

export default openDB;
