const form = document.getElementById('registerForm');
const message = document.getElementById('message');

form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Stop page refresh

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            message.className = "success";
            message.innerText = "Identity Created! Redirecting...";
            setTimeout(() => window.location.href = 'login.html', 1500);
        } else {
            message.className = "error";
            message.innerText = data.error || "Registration failed";
        }
    } catch (err) {
        message.innerText = "Server Unreachable";
    }
});