import {openDB} from "#config/db.js";

const createTables = async () => {

    let db;
    try {
        db = await openDB();

        // Create users table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log("✅ Users table created or already exists.");

        // Create notes table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);
        console.log("✅ Notes table created or already exists.");

        console.log("Database setup completed.");
    }
    catch (error) {
        console.error("❌ Error creating tables:", error);
    }
    finally {
        if(db) await db.close();
    }
}

createTables();