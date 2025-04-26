// MAIN.JS

const backendURL = 'http://localhost:5000/api';

// Login API
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;

        try {
            const res = await fetch(`${backendURL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', role);

                // Redirect based on role
                if (role === 'student') window.location.href = 'studentDashboard.html';
                else if (role === 'teacher') window.location.href = 'teacherDashboard.html';
                else if (role === 'admin') window.location.href = 'adminDashboard.html';
            } else {
                alert(data.msg);
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong');
        }
    });
}

// Student Registration API
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const res = await fetch(`${backendURL}/auth/register/student`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await res.json();

            if (res.ok) {
                alert('Registered Successfully! Wait for teacher approval.');
                window.location.href = 'login.html';
            } else {
                alert(data.msg);
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong');
        }
    });
}
// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = 'login.html';
}
