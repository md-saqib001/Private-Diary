import { openDB } from '#config/db.js';
import { z } from 'zod';

const noteSchema = z.object({
    title: z.string().optional(),
    content: z.string().min(1, "Note cannot be empty")
});

// 1. Get All Notes (Only for the logged-in user)
export const getNotes = async (req, res) => {
    let db;
    try {
        db = await openDB();
        
        // We do NOT ask the user "Who are you?". We trust the Session.
        const myUserId = req.session.userId;

        const notes = await db.all(
            'SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC', 
            [myUserId]
        );

        res.json(notes);
    } catch (error) {
        console.error("Get Notes Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        if (db) await db.close();
    }
};

// 2. Create a Note
export const createNote = async (req, res) => {
    let db;
    try {
        // Validate input
        const result = noteSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.errors[0].message });
        }

        const { title, content } = result.data;
        const myUserId = req.session.userId; // Get ID from session

        db = await openDB();

        // Insert the note linked to THIS user
        await db.run(
            'INSERT INTO notes (title, content, user_id) VALUES (?, ?, ?)',
            [title, content, myUserId]
        );

        res.status(201).json({ message: "Note created!" });

    } catch (error) {
        console.error("Create Note Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        if (db) await db.close();
    }
};