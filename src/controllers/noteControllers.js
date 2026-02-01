import { openDB } from '#config/db.js';
import e from 'express';
import { z } from 'zod';

const noteSchema = z.object({
    title: z.string().optional(),
    content: z.string().min(1, "Diary page cannot be empty"),
    // We optionally accept a date, otherwise we assume Today
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
});


// Get Notes (filtered by Month and year)
export const getNotes = async (req, res) => {
    let db;

    try {
        db=await openDB();

        const userId=req.session.userId;
        const { month, year } = req.query;

        let query=`SELECT * FROM notes WHERE user_id = ?`;
        let params=[userId];

        if(year && month) {
            query+=` AND date_id LIKE ?`;
            params.push(`${year}-${month}%`);
        }
        else if(year) {
            query+=` AND date_id LIKE ?`;
            params.push(`${year}`);
        }

        query+=` ORDER BY date_id DESC`;

        const notes=await db.all(query, params);

        res.json(notes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Error" });
    } finally {
        if (db) await db.close();
    }
};

// Get Single Note by Date (For the Calendar)
export const getNoteByDate = async (req, res) => {
    let db;

    try {
        db=await openDB();
        const userId=req.session.userId;
        const {date}=req.params;

        const note=await db.all(
            'SELECT * FROM notes WHERE user_id = ? AND date_id = ?',
            [userId, date]
        );

        if(!note) {
            return res.status(404).json({error: "No entry for this date"});
        }

        res.json(note);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Server Error"});
    } finally {
        if(db) await db.close();
    }
};

export const saveDailyPage = async (req, res) => {
    let db;
    try {
        const result = noteSchema.safeParse(req.body);
        if(!result.success) {
            return res.status(400).json({ error: result.error.errors[0].message });
        }

        const {title, content, date}=result.data;

        const userId=req.session.userId;

        const dateId=date;


        const [yyyy, mm, dd] = dateId.split('-');
        const displayDate = `${yyyy}-${mm}-${dd}`;
        const finalTitle = title || displayDate;

        db=await openDB();

        const existingNote =  await db.get(
            `SELECT id FROM notes WHERE user_id = ? and date_id=?`,
            [userId, dateId]
        );

        if(existingNote) {
            await db.run(
                'UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [finalTitle, content, existingNote.id]
            );
            res.json({message: "Page Updated!"});
        }
        else {
            await db.run(
                'INSERT INTO notes (user_id, title, content, date_id) VALUES (?, ?, ?, ?)',
                [userId, finalTitle, content, dateId]
            );

            res.status(201).json({message: "Page created"});
        }
    } catch (err) {
        console.error("Save Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        if (db) await db.close();
    }
};
