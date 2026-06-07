// Backend URL — change this when you deploy
const API_URL = "http://localhost:5000";

// ── Login Handler ──
async function handleLogin() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const loginBtn = document.getElementById("loginBtn");

  // Clear previous errors
  hideError();

  // Basic validation
  if (!email || !password) {
    showError("Please enter both email and password.");
    return;
  }

  // Show loading state
  loginBtn.textContent = "Logging in...";
  loginBtn.disabled = true;

  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Server returned an error (401, 400 etc.)
      showError(data.error || "Login failed. Please try again.");
      return;
    }

    // Save token and user info to localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // Redirect based on role
    const role = data.user.role;

    if (role === "employee") {
      window.location.href = "pages/employee-dashboard.html";
    } else if (role === "manager") {
      window.location.href = "pages/manager-dashboard.html";
    } else if (role === "admin") {
      window.location.href = "pages/admin-dashboard.html";
    } else {
      showError("Unknown role. Contact administrator.");
    }
  } catch (err) {
    // Network error — backend not running etc.
    showError("Cannot connect to server. Make sure backend is running.");
  } finally {
    // Always re-enable button
    loginBtn.textContent = "Login";
    loginBtn.disabled = false;
  }
}

// ── Show / Hide Error ──
function showError(message) {
  const box = document.getElementById("errorBox");
  const msg = document.getElementById("errorMsg");
  msg.textContent = message;
  box.classList.add("show");
}

function hideError() {
  document.getElementById("errorBox").classList.remove("show");
}

// ── Allow Enter key to submit ──
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("password").addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleLogin();
  });
});

// ── Logout ──
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "../index.html";
}

// ── Get logged in user from localStorage ──
function getUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

// ── Protect dashboard pages ──
// Call this at top of every dashboard page
function requireAuth(expectedRole) {
  const token = localStorage.getItem("token");
  const user = getUser();

  if (!token || !user) {
    window.location.href = "../index.html";
    return null;
  }

  if (expectedRole && user.role !== expectedRole) {
    alert("Access denied. Redirecting...");
    window.location.href = "../index.html";
    return null;
  }

  return user;
}
