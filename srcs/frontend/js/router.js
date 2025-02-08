import {renderPageNotFound} from "./pages/404.js"
const routes = {};
const publicRoutes = ['/login', '/signup'];

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

export async function loadPage(route) {
  const renderFunction = routes[route];

  if (!publicRoutes.includes(route)) {
      const isAuthenticated = await tokenService.validateToken();
      if (!isAuthenticated) {
          navigateTo('/login');
          return;
      }
  }

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


//osema refresh token

export const tokenService = {
  setAccessToken(token) {
      localStorage.setItem('access_token', token);
  },

  getAccessToken() {
      return localStorage.getItem('access_token');
  },

  removeTokens() {
      localStorage.removeItem('access_token');
  },

  async validateToken() {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
        const response = await fetch('http://localhost:8000/auth/validate/', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (response.ok) return true;

        const refreshResponse = await fetch('http://localhost:8000/auth/refresh/', {
            method: 'POST',
            credentials: 'include'
        });

        if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            this.setAccessToken(data.access);
            return true;
        }

        this.removeTokens();
        return false;
    } catch (error) {
        console.error('Auth validation error:', error);
        this.removeTokens();
        return false;
    }
  }
};
