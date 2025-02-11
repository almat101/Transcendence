import { registerRoute, loadPage } from "./router.js";
import { renderLoginPage } from "./pages/login.js";
import { renderSignupPage } from "./pages/signup.js";
import { renderHomePage } from "./pages/home.js";
import { renderChatPage } from "./pages/chat.js";
import { renderPongPage } from "./pages/pong.js";
import { renderUsersPage } from "./pages/users.js";
import { renderPostPage } from "./pages/post.js";
import { renderSettingsPage } from "./pages/settings.js";
import { renderLogoutPage } from "./pages/logout.js";
import { renderPageNotFound } from "./pages/404.js";
import { renderOAuthCallbackPage } from "./pages/oauthCallback.js";
//import { navigateTo } from "./router.js";

// Register routes
registerRoute("/", renderHomePage);
registerRoute("/login", renderLoginPage);
registerRoute("/signup", renderSignupPage);
registerRoute("/chat", renderChatPage);
registerRoute("/pong", renderPongPage);
registerRoute("/users", renderUsersPage);
registerRoute("/post", renderPostPage);
registerRoute("/404", renderPageNotFound);
registerRoute("/settings", renderSettingsPage);
registerRoute("/logout", renderLogoutPage);
registerRoute("/oauth/callback", renderOAuthCallbackPage);

loadPage(window.location.pathname);
