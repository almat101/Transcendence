import { Navbar } from "../components/navbar.js";

const API_BASE_URL = "http://127.0.0.1:8000";

export function renderUsersPage() {
  const root = document.getElementById("root");
  root.innerHTML = ""; // Clear previous content

  // Add the navbar
  const navbar = Navbar();
  root.appendChild(navbar);

  // Add main content
  const usersContainer = document.createElement("div");
  usersContainer.id = "users-container";

  const heading = document.createElement("h1");
  heading.textContent = "Users Page";
  usersContainer.appendChild(heading);

  const description = document.createElement("p");
  description.textContent =
    "This page fetches and displays users from the backend API.";
  usersContainer.appendChild(description);

  // Add a loading indicator
  const loadingIndicator = document.createElement("p");
  loadingIndicator.id = "loading-indicator";
  loadingIndicator.textContent = "Loading users...";
  usersContainer.appendChild(loadingIndicator);

  // Add a container for dinamically load the users with the API calls
  const usersList = document.createElement("ul");
  usersList.id = "users-list";
  usersContainer.appendChild(usersList);

  root.appendChild(usersContainer);

  // Fetch and render users
  renderUsers(usersList, loadingIndicator);

}

export async function renderUsers(usersList, loadingIndicator) {
  try {
    // Make the API call
    const response = await fetch(`${API_BASE_URL}/api/users/`);
    if (!response.ok) {
      throw new Error(
        `Error fetching users: ${response.status} ${response.statusText}`
      );
    }

    const users = await response.json(); // Parse the JSON data from the response

    // Clear the loading indicator
    loadingIndicator.textContent = "";

    // Render users in the list
    usersList.innerHTML = ""; // Clear any previous content
    users.forEach((user) => {
      const listItem = document.createElement("li");
      listItem.textContent = `${user.name} (${user.age})`;
      usersList.appendChild(listItem);
    });
  } catch (error) {
    console.error("Error fetching users:", error);

    // Update the loading indicator with an error message
    loadingIndicator.textContent =
      "Failed to load users. Please try again later.";
  }
}
