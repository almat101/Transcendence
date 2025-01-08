import { Navbar } from "../components/navbar.js";

export function renderHomePage() {
  const root = document.getElementById("root");
  root.innerHTML = ""; // Clear previous content

  // Add the navbar
  const navbar = Navbar();
  root.appendChild(navbar);

  // Add main content
  const homeContainer = document.createElement("div");
  homeContainer.id = "home-container";

  const heading = document.createElement("h1");
  heading.textContent = "Welcome to the Home Page!";
  homeContainer.appendChild(heading);

  const description = document.createElement("p");
  description.textContent = "This is the Home Page!";
  homeContainer.appendChild(description);

  root.appendChild(homeContainer);
}
