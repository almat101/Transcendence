import { Navbar } from "../components/navbar.js";

export function renderChatPage() {
  const root = document.getElementById("root");
  root.innerHTML = ""; // Clear previous content

  // Add the navbar
  const navbar = Navbar();
  root.appendChild(navbar);

  // Add main content
  const chatContainer = document.createElement("div");
  chatContainer.id = "chat-container";

  const heading = document.createElement("h1");
  heading.textContent = "Welcome to the chat Page!";
  chatContainer.appendChild(heading);

  const description = document.createElement("p");
  description.textContent = "This is the chat Page!";
  chatContainer.appendChild(description);

  root.appendChild(chatContainer);
}
