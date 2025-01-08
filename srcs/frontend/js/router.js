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
    console.error(`Route '${route}' not found.`);
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

// dinamically load the content of the page based on the route
window.addEventListener('load', () => {
  console.log("on load page refresh!");
  const currentRoute = window.location.pathname || "/"
  loadPage(currentRoute)
});

// Handle browser navigation (back/forward buttons)
window.addEventListener("popstate", () => {
  console.log("back forward button ");
  const currentRoute = window.location.pathname || "/";
  loadPage(currentRoute);
});
