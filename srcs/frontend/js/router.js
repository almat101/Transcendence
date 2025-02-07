import {renderPageNotFound} from "./pages/404.js"
const routes = {};

/**
 * Register a route with its associated render function.
 * @param {string} path - The path for the route.
 * @param {function} renderFunction - The function to render the page.
 */
export function registerRoute(path, renderFunction) {
  routes[path] = renderFunction;
}

/**
 * Load a page based on the current route.
 * @param {string} route - The path of the route to load.
 */
export function loadPage(route) {
  const renderFunction = routes[route];
  if (renderFunction) {
    renderFunction();
  } else {
    renderPageNotFound();
  }
}

/**
 * Navigate to a new route.
 * @param {string} route - The path of the new route.
 */
export function navigateTo(route) {
  window.history.pushState({}, "", route);
  loadPage(route);
}


// Handle initial load and browser navigation (back/forward buttons)
function handleNavigation() {
  const currentRoute = window.location.pathname || "/";
  loadPage(currentRoute);
}

// initial load
window.addEventListener("load", handleNavigation);
// back/forward buttons
window.addEventListener("popstate", handleNavigation);
