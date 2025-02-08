import { navigateTo } from "../router.js";

export function Navbar() {
  // Create the navbar container
  const navbar = document.createElement("nav");
  navbar.className = "navbar navbar-expand-md bg-body-tertiary";

  // Create the container-fluid div
  const container = document.createElement("div");
  container.className = "container-fluid";

  // Create the navbar-toggler button
  const toggler = document.createElement("button");
  toggler.className = "navbar-toggler";
  toggler.type = "button";
  toggler.setAttribute("data-bs-toggle", "collapse");
  toggler.setAttribute("data-bs-target", "#navbarTogglerPong");
  toggler.setAttribute("aria-controls", "navbarTogglerPong");
  toggler.setAttribute("aria-expanded", "false");
  toggler.setAttribute("aria-label", "Toggle navigation");

  const togglerIcon = document.createElement("span");
  togglerIcon.className = "navbar-toggler-icon";
  toggler.appendChild(togglerIcon);

  // Create the collapse div
  const collapse = document.createElement("div");
  collapse.className = "collapse navbar-collapse";
  collapse.id = "navbarTogglerPong";

  // Create the navbar-nav ul
  const nav = document.createElement("ul");
  nav.className = "navbar-nav justify-content-around w-100";

  // Add links
  const links = [
    { name: "Home", route: "/" },
    { name: "Pong", route: "/pong" },
    { name: "Chat", route: "/chat" },
    { name: "Users", route: "/users" },
  ];

  links.forEach((link) => {
    const listItem = document.createElement("li");
    listItem.className = "nav-item";

    const anchor = document.createElement("a");
    anchor.className = "nav-link";
    anchor.textContent = link.name;
    anchor.href = link.route;

    // Prevent full page reload and use SPA navigation
    anchor.addEventListener("click", (event) => {
      event.preventDefault();
      navigateTo(link.route);
    });

    listItem.appendChild(anchor);
    nav.appendChild(listItem);
  });

  // Append elements to the navbar
  collapse.appendChild(nav);
  container.appendChild(toggler);
  container.appendChild(collapse);
  navbar.appendChild(container);

  return navbar;
}

// export function Navbar() {
//   // Create the navbar container
//   const navbar = document.createElement("nav");
//   navbar.className = "navbar";

//   // Add links
//   const links = [
//     { name: "Home", route: "/" },
//     { name: "Login", route: "/login" },
//     { name: "Pong", route: "/pong" },
//     { name: "Chat", route: "/chat"},
//     { name: "Users", route: "/users"},
//     { name: "Post", route: "/post"}
//   ];

//   links.forEach((link) => {
//     const anchor = document.createElement("a");
//     anchor.textContent = link.name;
//     anchor.href = link.route;

//     // Prevent full page reload and use SPA navigation
//     anchor.addEventListener("click", (event) => {
//       event.preventDefault();
//       navigateTo(link.route);
//     });

//     navbar.appendChild(anchor);
//   });

//   return navbar;
// }

// export function Navbar() {
//   // Create the navbar container
//   const navbar = document.createElement("nav");
//   navbar.className = "navbar bg-body-tertiary fixed-top";

//   const container = document.createElement("div");
//   container.className = "container-fluid";

//   const brand = document.createElement("a");
//   brand.className = "navbar-brand";
//   brand.href = "#";
//   brand.textContent = "Offcanvas navbar";

//   const toggler = document.createElement("button");
//   toggler.className = "navbar-toggler";
//   toggler.type = "button";
//   toggler.setAttribute("data-bs-toggle", "offcanvas");
//   toggler.setAttribute("data-bs-target", "#offcanvasNavbar");
//   toggler.setAttribute("aria-controls", "offcanvasNavbar");
//   toggler.setAttribute("aria-label", "Toggle navigation");

//   const togglerIcon = document.createElement("span");
//   togglerIcon.className = "navbar-toggler-icon";
//   toggler.appendChild(togglerIcon);

//   const offcanvas = document.createElement("div");
//   offcanvas.className = "offcanvas offcanvas-end";
//   offcanvas.tabIndex = -1;
//   offcanvas.id = "offcanvasNavbar";
//   offcanvas.setAttribute("aria-labelledby", "offcanvasNavbarLabel");

//   const offcanvasHeader = document.createElement("div");
//   offcanvasHeader.className = "offcanvas-header";

//   const offcanvasTitle = document.createElement("h5");
//   offcanvasTitle.className = "offcanvas-title";
//   offcanvasTitle.id = "offcanvasNavbarLabel";
//   offcanvasTitle.textContent = "Offcanvas";

//   const closeButton = document.createElement("button");
//   closeButton.type = "button";
//   closeButton.className = "btn-close";
//   closeButton.setAttribute("data-bs-dismiss", "offcanvas");
//   closeButton.setAttribute("aria-label", "Close");

//   offcanvasHeader.appendChild(offcanvasTitle);
//   offcanvasHeader.appendChild(closeButton);

//   const offcanvasBody = document.createElement("div");
//   offcanvasBody.className = "offcanvas-body";

//   const navList = document.createElement("ul");
//   navList.className = "navbar-nav justify-content-end flex-grow-1 pe-3";

//   const links = [
//     { name: "Home", route: "/" },
//     { name: "Login", route: "/login" },
//     { name: "Pong", route: "/pong" },
//     { name: "Chat", route: "/chat" },
//     { name: "Users", route: "/users" },
//     { name: "Post", route: "/post" }
//   ];

//   links.forEach((link) => {
//     const listItem = document.createElement("li");
//     listItem.className = "nav-item";

//     const anchor = document.createElement("a");
//     anchor.className = "nav-link";
//     anchor.textContent = link.name;
//     anchor.href = link.route;

//     // Prevent full page reload and use SPA navigation
//     anchor.addEventListener("click", (event) => {
//       event.preventDefault();
//       navigateTo(link.route);
//     });

//     listItem.appendChild(anchor);
//     navList.appendChild(listItem);
//   });

//   offcanvasBody.appendChild(navList);

//   offcanvas.appendChild(offcanvasHeader);
//   offcanvas.appendChild(offcanvasBody);

//   container.appendChild(brand);
//   container.appendChild(toggler);
//   container.appendChild(offcanvas);

//   navbar.appendChild(container);

//   return navbar;
// }
