import { Navbar } from "../components/navbar.js";

// export function renderPageNotFound(){
//   document.body.innerHTML = `
//   <div>
//     <h1>404 - Page Not Found</h1>
//     <p>The page you are looking for doesn't exist.</p>
//     <a href="/">Go Back to Home</a>
//   </div>`;
// };
export function renderPageNotFound() {
  const root = document.getElementById("root");
  root.innerHTML = ""; // Clear previous content

  // Add the navbar
  const navbar = Navbar();
  root.appendChild(navbar);

  // Add main content
  const homeContainer = document.createElement("div");
  homeContainer.id = "404-container";

  const heading = document.createElement("h1");
  heading.textContent = "404";
  homeContainer.appendChild(heading);

  const description = document.createElement("p");
  description.textContent = "page not found!";
  homeContainer.appendChild(description);
  root.appendChild(homeContainer);
}
