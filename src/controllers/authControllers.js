import {openDB} from "#config/db.js";
import bcrypt from "bcrypt";
import {z} from "zod";
import { ca } from "zod/locales";

const registerSchema = z.object({
    username: z.string().min(3, "Username must be at atleast 3 characters")
                        .max(30, "Username must be atmost 30 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters")
});

export const registerUser = async (req, res) => {
    let db;
    try {
        const { username, email, password } = registerSchema.parse(req.body);
        db = await openDB();

        // Check if email already exists
        const existingUser = await db.get('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);

        if (existingUser) {
            return res.status(409).json({ message: "Username or Email already in use." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Insert new user into the database
        await db.run(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        res.status(201).json({ message: 'User registered successfully!' });
    }
    catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
    finally {
        if (db) await db.close();
    }
}

export const loginUser = async (req, res) => {
    let db;
    try {
        const { email, password } = req.body;

        if(!email || !password) {
            return res.status(400).json({ message: "Email and Password are required." });
        }

        db = await openDB();

        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        // Create session
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.email = user.email;

        res.json({ message: "Login successful!" , user: { username: user.username, email: user.email }});
    }
    catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
    finally {
        if (db) await db.close();
    }
}

export const logoutUser = (req, res) => {
    // 1. Destroy the session in the database
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "Could not log out" });
        }

        // 2. Clear the cookie on the browser
        // We set the cookie name to 'connect.sid' (default)
        res.clearCookie('connect.sid'); 
        
        res.json({ message: "Logout successful" });
    });
};

// GET /api/auth/me (Who am I?)
export const getMe = (req, res) => {
    if (req.session.userId) {
        // The session already stores the username! We just send it back.
        res.json({ 
            username: req.session.username,
            email: req.session.email
        });
    } else {
        res.status(401).json({ error: "Not authenticated" });
    }
};
