import { showAlert } from '../components/alert.js';
import { authService } from '../services/authService.js';

export function renderSignupPage() {
  const root = document.getElementById("root");
  root.innerHTML = ""; // Clear previous content

   // Add required CSS
  const style = document.createElement('style');
  style.textContent = `
    .cascading-right {
      margin-right: -50px;
    }
    @media (max-width: 991.98px) {
      .cascading-right {
        margin-right: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // Add login form
  const section = document.createElement('section');
  section.className = 'text-center text-lg-start';

  // Create container structure
  const container = `
    <div class="container py-4 align-items-center">
      <div class="row g-0 align-items-center justify-content-center">
        <div class="col-lg-6 mb-5 mb-lg-0">
          <div class="card cascading-right bg-body-tertiary text-center" style="backdrop-filter: blur(30px);"  id="login-card">
            <div class="card-body p-5 shadow-10 text-center">
              <h2 class="fw-bold mb-5">Sign up now</h2>
              <form id="login-form">
                <div class="form-outline mb-4">
                  <label class="form-label" for="username">Username</label>
                  <input type="text" id="username" class="form-control" required />
                </div>

                <div class="form-outline mb-4">
                  <label class="form-label" for="email">Email address</label>
                  <input type="email" id="email" class="form-control" required />
                </div>

                <div class="form-outline mb-4">
                  <label class="form-label" for="password">Password</label>
                  <input type="password" id="password" class="form-control" required />
                </div>

                <div class="form-outline mb-4">
                  <label class="form-label" for="confirm-password">Confirm Password</label>
                  <input type="password" id="confirm-password" class="form-control" required />
                </div>

                <button type="submit" class="btn btn-primary btn-block mb-4">
                  Sign up
                </button>

                <div class="text-center">
                  <p>or sign up with:</p>
                  <button type="button" class="btn btn-link btn-floating mx-1" id="oauth-42">
                    <img src="/assets/42_Logo.svg.png" alt="42 Logo" style="width: 20px; height: 20px;">
                  </button>
                </div>
              </form>
            </div>
            <p class="mb-5">Already have an account? <a href="/login" class="fw-bold">Login</a></p>
          </div>
        </div>
        <div class="col-lg-6 mb-5 mb-lg-0 d-none d-lg-block">
          <img src="/assets/846-02793586en_Masterfile.jpg" class="w-100 rounded-4 shadow-4" alt="Login background" />
        </div>
      </div>
    </div>
  `;

  section.innerHTML = container;
  root.appendChild(section);

  const oauthButton = document.getElementById('oauth-42');
  oauthButton.addEventListener('click', async () => {
    const result = await authService.oauth42Login();
    if (result.success) {
        window.location.href = result.url;
    } else {
        console.error('Error:', result.error);
        showAlert('Servers are busy, try again!', 'danger');
      }
  });

  // Add form submission handler
  const form = document.getElementById('login-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirm_password = document.getElementById('confirm-password').value;

    // Frontend validation
    if (!username.match(/^[a-zA-Z0-9_]{3,20}$/)) {
      showAlert("Username must be 3-20 characters long and contain only letters, numbers, and underscores");
      return;
    }

    if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
      showAlert("Please enter a valid email address");
      return;
    }

    if (password.length < 8) {
      showAlert("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirm_password) {
      showAlert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/user/signup/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username,
          email,
          password,
          confirm_password
        })
     });

      const data = await response.json();

      if (response.ok) {
        showAlert('Signup successful! Redirecting to login page...', 'success');
        window.location.href = '/login';
      } else {
        // Handle different error cases
        if (data.username) {
          showAlert(data.username);
        } else if (data.email) {
          showAlert(data.email);
        } else if (data.password) {
          showAlert(data.password);
        } else if (data.confirm_password) {
          showAlert(data.confirm_password);
        }
        else {
          showAlert(data.error || 'Signup failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      showAlert('Something went wrong. Please try again later.', 'danger');
    }
  });
}

