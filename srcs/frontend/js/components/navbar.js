import { navigateTo } from "../router.js";

export function Navbar() {
  // Create the navbar container
  const navbar = document.createElement("nav");
  navbar.className = "navbar";

  // Add links
  const links = [
    { name: "Home", route: "/" },
    { name: "Login", route: "/login" },
    { name: "Pong", route: "/pong" },
    { name: "Chat", route: "/chat"},
    { name: "Users", route: "/users"},
    { name: "Post", route: "/post"}
  ];

  links.forEach((link) => {
    const anchor = document.createElement("a");
    anchor.textContent = link.name;
    anchor.href = link.route;

    // Prevent full page reload and use SPA navigation
    anchor.addEventListener("click", (event) => {
      event.preventDefault();
      navigateTo(link.route);
    });

    navbar.appendChild(anchor);
  });

  return navbar;
}
