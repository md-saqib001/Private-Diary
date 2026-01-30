import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import authRouter from '#routes/authRoutes.js';
import path from 'path';
import connectSqlite3 from 'connect-sqlite3';
import noteRouter from '#routes/noteRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Determine Environment
// "production" is the standard value cloud providers use.
const isProduction = process.env.NODE_ENV === 'production';

// Trust Proxy (CRITICAL for Deployment)
// Cloud providers (like Render/Replit) use a "Load Balancer" that sits in front of your app.
// Without this line, Express thinks the connection is insecure (HTTP) even if the user sees HTTPS.
if (isProduction) {
    app.set('trust proxy', 1); 
}


// Session store setup
const SQLiteStore = connectSqlite3(session);
app.use(session({
    store: new SQLiteStore({
        dir: process.env.DB_DIR || "database",
        db: path.basename(process.env.DB_PATH || path.join("database", "sessions.db"))
    }),
    secret: process.env.SESSION_SECRET || 'fallback_secret_key', // The lock key
    resave: false,               // Don't save if nothing changed (Performance)
    saveUninitialized: false,    // Don't create sessions for anon visitors (GDPR/Privacy)
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24, // 1 Day (in milliseconds)
        httpOnly: true,              // Security: JavaScript cannot read this cookie
        secure: isProduction,        // Only send cookie over HTTPS in production
        sameSite: 'lax'             // CSRF protection
    }
}))

// Middleware
app.use(express.json()); // Allow server to read JSON bodies (req.body)
app.use(express.urlencoded({ extended: true })); // Allow reading HTML form data

// Serve Frontend Files
// Any file in 'public' (like index.html) can be seen by anyone
app.use(express.static('public'));

//  Mount Routes 
app.use('/api/auth', authRouter);
app.use('/api/notes', noteRouter);

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});