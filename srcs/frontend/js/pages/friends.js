import { Navbar } from "../components/navbar.js";
import { tokenService } from "../services/authService.js";
import { showAlert } from '../components/alert.js';

export async function renderFriendsPage() {
    const root = document.getElementById("root");
    root.innerHTML = "";

    // Add navbar
    const navbar = Navbar();
    root.appendChild(navbar);

    // Create main container with sidebar layout
    const mainContainer = document.createElement("div");
    mainContainer.className = "friends-container";
    mainContainer.innerHTML = `
        <div class="friends-sidebar">
            <div class="search-container mb-3">
                <input
                    type="search"
                    id="searchInput"
                    class="form-control"
                    placeholder="Search users..."
                    autocomplete="off"
                >
                <div id="searchResults" class="search-results"></div>
            </div>

            <div class="friends-list">
                <h6 class="friends-list-header">Friends</h6>
                <div id="friendsList"></div>
            </div>
        </div>
        <div class="chat-area">
            <!-- Chat area will be implemented later -->
        </div>
    `;

    root.appendChild(mainContainer);

    // Initialize friends list
    loadFriendsList();

	// Add click outside listener
    document.addEventListener('click', (e) => {
        const searchContainer = document.querySelector('.search-container');
        const searchResults = document.getElementById('searchResults');

        if (!searchContainer.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });

    // Prevent search input from closing results
    document.getElementById('searchInput').addEventListener('click', (e) => {
        e.stopPropagation();
        const query = e.target.value;
        if (query.length >= 2) {
            document.getElementById('searchResults').style.display = 'block';
        }
    });

    // Add search input listener with debounce
    let searchTimeout;
    document.getElementById('searchInput').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => performSearch(e.target.value), 300);
    });

}

async function loadFriendsList() {
    try {
        const response = await fetch('http://localhost:8000/user/friends/', {
            headers: {
                'Authorization': `Bearer ${tokenService.getAccessToken()}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch friends');

        const friends = await response.json();
        displayFriendsList(friends);
    } catch (error) {
        console.error('Error:', error);
        showAlert('Failed to load friends list', 'danger');
    }
}

function displayFriendsList(friends) {
    const friendsList = document.getElementById('friendsList');

    if (!friends.length) {
        friendsList.innerHTML = '<p class="text-muted text-center">No friends yet</p>';
        return;
    }

    friendsList.innerHTML = friends.map(friend => `
        <div class="friend-item" onclick="window.location.href='/profile/${friend.username}'">
            <img src="${friend.avatar || '/images/default-avatar.jpg'}"
                 alt="${friend.username}'s avatar"
                 class="friend-avatar">
            <span class="friend-name">${friend.username}</span>
        </div>
    `).join('');
}

async function performSearch(query) {
    if (query.length < 2) {
        document.getElementById('searchResults').style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`http://localhost:8000/user/search/?q=${encodeURIComponent(query)}`, {
            headers: {
                'Authorization': `Bearer ${tokenService.getAccessToken()}`
            }
        });

        if (!response.ok) throw new Error('Search failed');

        const users = await response.json();
        displaySearchResults(users);
    } catch (error) {
        console.error('Search error:', error);
        showAlert('Failed to search users', 'danger');
    }
}

function displaySearchResults(users) {
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.style.display = 'block';

    if (!users.length) {
        resultsDiv.innerHTML = '<p class="text-muted p-2">No users found</p>';
        return;
    }

    resultsDiv.innerHTML = users.map(user => `
        <div class="search-result-item">
            <div class="user-info" onclick="event.stopPropagation(); window.location.href='/profile/${user.username}'">
                <img src="${user.avatar || '/images/default-avatar.jpg'}" alt="${user.username}'s avatar">
                <span>${user.username}</span>
            </div>
            <button class="btn btn-sm btn-outline-primary add-friend-btn"
                    onclick="event.stopPropagation(); sendFriendRequest('${user.username}')">
                Add Friend
            </button>
        </div>
    `).join('');
}
