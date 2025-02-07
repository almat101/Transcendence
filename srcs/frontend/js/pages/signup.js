export function renderLoginPage() {
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
      <div class="row g-0 align-items-center">
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

                <button type="submit" class="btn btn-primary btn-block mb-4">
                  Sign up
                </button>

                <div class="text-center">
                  <p>or sign up with:</p>
                  <button type="button" class="btn btn-link btn-floating mx-1">
                    <img src="/assets/42_Logo.svg.png" alt="42 Logo" style="width: 20px; height: 20px;">
                  </button>
                </div>
              </form>
            </div>
            <p class="mb-5">Already have an account? <a href="/login" class="fw-bold">Login</a></p>
          </div>
        </div>
        <div class="col-lg-6 mb-5 mb-lg-0">
          <img src="/assets/846-02793586en_Masterfile.jpg" class="w-100 rounded-4 shadow-4" alt="Login background" />
        </div>
      </div>
    </div>
  `;

  section.innerHTML = container;
  root.appendChild(section);

  // Add form submission handler
  const form = document.getElementById('login-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Add your form handling logic here
  });
}
