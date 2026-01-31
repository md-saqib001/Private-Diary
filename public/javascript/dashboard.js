const usernameDisplay = document.getElementById('usernameDisplay');
const logoutBtn = document.getElementById('logoutBtn');

// Today Section Elements
const todayDateEl = document.getElementById('todayDate');
const todayStatusEl = document.getElementById('todayStatus');
const todayBtn = document.getElementById('todayBtn');

// History Section Elements
const notesList = document.getElementById('notesList');
const filterBtn = document.getElementById('filterBtn');
const yearFilter = document.getElementById('yearFilter');
const monthFilter = document.getElementById('monthFilter');

// 1. Calculate Today's Date (Local Time) 📅
// We need YYYY-MM-DD to compare with DB, and DD-MM-YYYY to display.
const now = new Date();
const yyyy = now.getFullYear();
const mm = String(now.getMonth() + 1).padStart(2, '0');
const dd = String(now.getDate()).padStart(2, '0');

const todayISO = `${yyyy}-${mm}-${dd}`; // 2026-02-01 (For Logic)
const todayDisplay = `${dd}-${mm}-${yyyy}`; // 01-02-2026 (For Display)

// Set the visual date immediately
todayDateEl.innerText = `TODAY (${todayDisplay})`;

// Fetch User Details
async function loadUserIdentity() {
    try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
            const data = await res.json();
            // Update the HTML element
            usernameDisplay.innerText = data.username; 
        }
    } catch (err) {
        console.error("Failed to load user info:", err);
    }
}

// Fetch and Sort Notes 🚀
async function loadDashboard() {
    // Get filters
    const year = yearFilter.value;
    const month = monthFilter.value;
    
    let url = '/api/notes';
    const params = new URLSearchParams();
    if(year) params.append('year', year);
    if(month) params.append('month', month);
    if(params.toString()) url += `?${params.toString()}`;

    try {
        const res = await fetch(url);
        if (res.status === 401) return window.location.href = 'login.html';
        
        const notes = await res.json();
        
        processNotes(notes);

    } catch (err) {
        console.error("Error:", err);
    }
}

// 3. Separate "Today" from "History" 🕵️‍♂️
function processNotes(notes) {
    // A. Handle Today's Section
    // Search for a note that matches todayISO
    const todayNote = notes.find(n => n.date_id === todayISO);

    if (todayNote) {
        todayStatusEl.innerText = `"${todayNote.title}"`;
        todayBtn.innerText = "✏️ Edit Today's Page";
        // We will build view.html next. Passing date as a parameter.
        todayBtn.href = `view.html?date=${todayISO}`;
    } else {
        todayStatusEl.innerText = "The pages are empty...";
        todayBtn.innerText = "✍️ Write Today's Page";
        todayBtn.href = `view.html?date=${todayISO}`; // Logic is same: Open view for today
    }

    // B. Handle History List (Exclude Today from the list if present)
    const historyNotes = notes.filter(n => n.date_id !== todayISO);
    renderHistory(historyNotes);
}

// 4. Render the List 📜
function renderHistory(notes) {
    if (notes.length === 0) {
        notesList.innerHTML = '<p style="text-align: center; color: #8b949e;">No past entries found.</p>';
        return;
    }

    notesList.innerHTML = notes.map(note => {
        // Format date for display (YYYY-MM-DD -> DD-MM-YYYY)
        const [y, m, d] = note.date_id.split('-');
        
        return `
        <div class="archive-card" onclick="window.location.href='view.html?date=${note.date_id}'">
            <span class="archive-title">${note.title || 'Untitled'}</span>
            <span class="archive-date">${d}-${m}-${y}</span>
        </div>
        `;
    }).join('');
}

// Filter Button Click
filterBtn.addEventListener('click', loadDashboard);

// Logout Logic
logoutBtn.addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = 'login.html';
});

// Init
loadUserIdentity();
loadDashboard();