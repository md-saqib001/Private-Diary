const form = document.getElementById('loginForm');
const message = document.getElementById('message');

let addMsgTimer;

const giveFeedback = (content) => {
    message.innerText = content;

    if(addMsgTimer) clearTimeout(addMsgTimer);
    
    addMsgTimer = setTimeout(() => {
        message.innerText = "";
        addMsgTimer = null;
    }, 5000);
};

form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Stop page refresh

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const res=await fetch('/api/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        });

        const data=await res.json();

        if(res.ok) {
            message.className='success';
            giveFeedback("Access Granted. Loading Dashboard....");

            setTimeout(() => {
                window.location.href='dashboard.html';
            }, 1000);
        }
        else {
            message.className = "error";
            giveFeedback(data.error || "Login failed");
        }
    } catch (err) {
        console.error(err);
        giveFeedback("Server Unreachable");
    }
});
