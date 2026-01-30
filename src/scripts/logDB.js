import {openDB} from "#config/db.js";

async function logTables() {
    let db;
    try {
        db = await openDB();

        // Retrieve and log all entries from users tables
        const usersTable=await db.all('SELECT * FROM users');
        console.log(`\n👥 USERS TABLE (${usersTable.length} found):`);
        console.table(usersTable);
        

        // Retrieve and log all entries from notes tables
        const notesTable=await db.all('SELECT * FROM notes');
        console.log(`\n📝 NOTES TABLE (${notesTable.length} found):`);
        console.table(notesTable);
    }
    catch (error) {
        console.error("Error retrieving links:", error);
    }
    finally {
        if(db) await db.close();
    }
}

logTables();

