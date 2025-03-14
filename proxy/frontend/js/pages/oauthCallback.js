import { authService } from "../services/authService.js";
import { navigateTo } from "../router.js";
import { showAlert } from "../components/alert.js";

export async function renderOAuthCallbackPage() {
    const root = document.getElementById("root");
    root.innerHTML = `
        <div class="container mt-5 text-center">
            <h2>Processing login...</h2>
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;

    // Get code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (!code) {
        showAlert('Authorization code missing', 'danger');
        setTimeout(() => navigateTo('/login'), 2000);
        return;
    }

    try {
        const result = await authService.handleOAuthCallback(code);
        if (result.success) {
            showAlert('Login successful!', 'success');
            navigateTo('/');
        } else {
            showAlert(result.error || 'Login failed', 'danger');
            setTimeout(() => navigateTo('/login'), 2000);
        }
    } catch (error) {
        showAlert('Authentication failed', 'danger');
        setTimeout(() => navigateTo('/login'), 2000);
    }
}
