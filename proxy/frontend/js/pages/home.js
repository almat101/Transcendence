import { Navbar } from "../components/navbar.js";

export function renderHomePage() {
  const root = document.getElementById("root");
  root.innerHTML = ""; // Clear previous content

  // Add the navbar component
  const navbar = Navbar();
  root.appendChild(navbar);

  const chatContainer = document.createElement("div");
  chatContainer.id = "pong-container";

  const heading = document.createElement("h1");
  heading.textContent = "Welcome to the Home Page!!";
  chatContainer.appendChild(heading);

  const description = document.createElement("p");
  description.textContent = "This is the Home Page!";
  chatContainer.appendChild(description);

  root.appendChild(chatContainer);
}

//// all code is created manually(document.createElement) and added at the end(.appendchild)
// export function renderHomePage() {
//   const root = document.getElementById("root");
//   root.innerHTML = ""; // Clear previous content

//   // Add the navbar
//   const navbar = Navbar();
//   root.appendChild(navbar);

//   const homeContainer = document.createElement("div");
//   homeContainer.id = "home-container";

//   const heading = document.createElement("h1");
//   heading.textContent = "Welcome to the Home Page!";
//   homeContainer.appendChild(heading);

//   const description = document.createElement("p");
//   description.textContent = "This is the Home Page!";
//   homeContainer.appendChild(description);

//   root.appendChild(homeContainer);
// }


