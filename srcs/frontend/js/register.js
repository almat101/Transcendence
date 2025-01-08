import { registerRoute, loadPage } from "./router.js";
import { renderLoginPage } from "./pages/login.js";
import { renderHomePage } from "./pages/home.js";
import { renderChatPage } from "./pages/chat.js";
import { renderPongPage } from "./pages/pong.js";
import { renderUsersPage } from "./pages/users.js";
import { renderPostPage } from "./pages/post.js";

// Register routes
registerRoute("/", renderHomePage);
registerRoute("/login", renderLoginPage);
registerRoute("/chat", renderChatPage);
registerRoute("/pong", renderPongPage);
registerRoute("/users", renderUsersPage);
registerRoute("/post", renderPostPage);

// Initial page load
const currentRoute = window.location.pathname || "/";
loadPage(currentRoute);

