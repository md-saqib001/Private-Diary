// 1. Get Elements
const dateDisplay = document.getElementById('dateDisplay');
const titleInput = document.getElementById('entryTitle');
const contentInput = document.getElementById('entryContent');
const saveBtn = document.getElementById('saveBtn');
const saveStatus = document.getElementById('saveStatus');
const readOnlyBadge = document.getElementById('readOnlyBadge');

// 2. Parse URL to find WHICH date we are looking at
const urlParams = new URLSearchParams(window.location.search);
const targetDate = urlParams.get('date'); // "2026-02-01"

if (!targetDate) {
    alert("No date specified!");
    window.location.href = 'dashboard.html';
}

// 3. Determine "Is this Today?" 📅
// We calculate 'Today' in local time (YYYY-MM-DD)
const now = new Date();
const yyyy = now.getFullYear();
const mm = String(now.getMonth() + 1).padStart(2, '0');
const dd = String(now.getDate()).padStart(2, '0');
const todayISO = `${yyyy}-${mm}-${dd}`;

const isToday = (targetDate === todayISO);

// 4. Initial Setup (UI Logic)
const [y, m, d] = targetDate.split('-');
dateDisplay.innerText = `ENTRY FOR: ${d}-${m}-${y}`; // Show nice DD-MM-YYYY

if (!isToday) {
    // 🔒 LOCKDOWN MODE (Past Entry)
    titleInput.disabled = true;
    contentInput.disabled = true;
    saveBtn.style.display = 'none'; // Hide save button
    readOnlyBadge.style.display = 'block'; // Show lock badge
    contentInput.placeholder = "No entry written for this day.";
}

// 5. Load Data from Server 📥
async function loadEntry() {
    try {
        console.log(`Fetching entry for date: ${targetDate}`);
        const res = await fetch(`/api/notes/${targetDate}`);

        console.log(`API Response Status: ${res.status}`);

        
        if (res.status === 401) return window.location.href = 'login.html';

        if (res.status === 404) {
            // No entry exists yet
            console.log("Server says: No note found for this date.");
            if (!isToday) {
                // It's the past AND empty? 
                contentInput.value = "You left this page blank.";
            } else {
                // It's Today? Ready to write!
                console.log("New entry for today");
            }
            return;
        }

        let data = await res.json();
        console.log("Data received:", data);

        const note = Array.isArray(data) ? data[0] : data;
        
        titleInput.value = note.title || "";
        contentInput.value = note.content || "";

    } catch (err) {
        console.error("Error loading entry:", err);
        saveStatus.innerText = "Error loading data.";
    }
}

// 6. Save Logic (Only enabled if isToday) 💾
if (isToday) {
    saveBtn.addEventListener('click', async () => {
        const title = titleInput.value;
        const content = contentInput.value;
        const date = targetDate; // "2026-02-01"

        if (!content.trim()) return alert("Page is empty!");

        saveBtn.disabled = true;
        saveBtn.innerText = "Saving...";

        try {
            const res = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, date })
            });

            if (res.ok) {
                saveStatus.innerText = "Saved just now";
                setTimeout(() => saveStatus.innerText = "", 3000);
            } else {
                alert("Failed to save");
            }
        } catch (err) {
            console.error(err);
            alert("Network Error");
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerText = "Save Entry";
        }
    });
}

// Run immediately
loadEntry();