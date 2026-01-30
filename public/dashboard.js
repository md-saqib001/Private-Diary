const notesList = document.getElementById('notesList');
const saveBtn = document.getElementById('saveNoteBtn');
const logoutBtn = document.getElementById('logoutBtn');

// 1. Load Notes on Startup 🚀
async function loadNotes() {
    try {
        const res = await fetch('/api/notes');
        
        // 🚨 CRITICAL SECURITY CHECK
        // If the server says "401 Unauthorized", it means our cookie is invalid/missing.
        // We must redirect to login immediately.
        if (res.status === 401) {
            window.location.href = 'login.html';
            return;
        }

        const notes = await res.json();
        renderNotes(notes);
    } catch (err) {
        console.error("Error loading notes:", err);
        notesList.innerHTML = '<p class="error">Failed to load data. Is the server running?</p>';
    }
}

// 2. Convert Data to HTML 🎨
function renderNotes(notes) {
    if (notes.length === 0) {
        notesList.innerHTML = '<p style="text-align: center; color: #8b949e;">No entries found. Start writing...</p>';
        return;
    }

    // Map through the array and create HTML for each note
    notesList.innerHTML = notes.map(note => `
        <div class="note-card">
            <div style="display: flex; justify-content: space-between;">
                <strong>${note.title || 'Untitled'}</strong>
                <span class="note-date">${new Date(note.created_at).toLocaleString()}</span>
            </div>
            <p style="white-space: pre-wrap;">${note.content}</p>
        </div>
    `).join('');
}

// 3. Save New Note Logic 💾
saveBtn.addEventListener('click', async () => {
    const title = document.getElementById('noteTitle').value;
    const content = document.getElementById('noteContent').value;

    if (!content.trim()) return alert("Content cannot be empty");

    try {
        const res = await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content })
        });

        if (res.ok) {
            // Success! Clear inputs and reload the list to show the new note
            document.getElementById('noteTitle').value = '';
            document.getElementById('noteContent').value = '';
            loadNotes();
        } else {
            const data = await res.json();
            alert(data.error || "Failed to save note");
        }
    } catch (err) {
        console.error(err);
        alert("Server error");
    }
});

// 4. Logout Logic 🚪
logoutBtn.addEventListener('click', async () => {
    try {
        // Call the API to destroy the session server-side
        await fetch('/api/auth/logout', { method: 'POST' });
        
        // THEN redirect to login
        window.location.href = 'login.html';
    } catch (err) {
        console.error("Logout failed:", err);
        // Even if it fails, let's redirect them so they don't feel stuck
        window.location.href = 'login.html';
    }
});

// Run the load function as soon as the script starts
loadNotes();