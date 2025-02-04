import { Navbar } from "../components/navbar.js";

export function renderLoginPage() {
  const root = document.getElementById("root");
  root.innerHTML = ""; // Clear previous content

  // Add the navbar
  const navbar = Navbar();
  root.appendChild(navbar);


  //
  // this has to be changed with bootstrap login form
  //


  // Add login form
  const loginContainer = document.createElement("div");
  loginContainer.id = "login-container";

  const heading = document.createElement("h1");
  heading.textContent = "Login";
  loginContainer.appendChild(heading);

  const form = document.createElement("form");
  form.id = "login-form";

  const usernameLabel = document.createElement("label");
  usernameLabel.setAttribute("for", "username");
  usernameLabel.textContent = "Username:";
  form.appendChild(usernameLabel);

  const usernameInput = document.createElement("input");
  usernameInput.type = "text";
  usernameInput.id = "username";
  usernameInput.name = "username";
  usernameInput.required = true;
  form.appendChild(usernameInput);

  const passwordLabel = document.createElement("label");
  passwordLabel.setAttribute("for", "password");
  passwordLabel.textContent = "Password:";
  form.appendChild(passwordLabel);

  const passwordInput = document.createElement("input");
  passwordInput.type = "password";
  passwordInput.id = "password";
  passwordInput.name = "password";
  passwordInput.required = true;
  form.appendChild(passwordInput);

  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.textContent = "Login";
  form.appendChild(submitButton);

  loginContainer.appendChild(form);
  root.appendChild(loginContainer);

//  this function make the api call to the backend
//   form.addEventListener("submit", handleLogin);
}
