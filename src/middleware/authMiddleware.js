// This function sits between the User and the Final Route.
export const isAuthenticated = (req, res, next) => {
    // 1. Check if the session has a userId
    if (req.session.userId) {
        // Success! The user is logged in.
        // "next()" tells Express: "Move to the next function (the actual controller)."
        return next();
    }

    // Stop! No ticket found.
    // 401 means "Unauthorized"
    return res.status(401).json({ error: "Unauthorized. You must log in to view this." });
};