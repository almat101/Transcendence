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
        const response = await fetch('http://localhost:8000/user/friends/list-friends/', {
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

    resultsDiv.innerHTML = users.map(user => {
        const buttonConfig = getFriendButtonConfig(user.friendship_status);

        return `
            <div class="search-result-item">
                <div class="user-info" onclick="event.stopPropagation(); window.location.href='/profile/${user.username}'">
                    <img src="${user.avatar || '/images/default-avatar.jpg'}"
                         alt="${user.username}'s avatar"
                    >
                    <div class="user-details">
                        <span class="username">${user.username}</span>
                        ${user.bio ? `<small class="bio">${user.bio}</small>` : ''}
                    </div>
                </div>
                <button class="btn btn-sm ${buttonConfig.class}"
                        data-user-id="${user.id}"
                        ${buttonConfig.action ? `onclick="event.stopPropagation(); ${buttonConfig.action}('${user.id}')"` : ''}
                        ${!buttonConfig.action ? 'disabled' : ''}
                >
                    ${buttonConfig.text}
                </button>
            </div>
        `;
    }).join('');
}

function getFriendButtonConfig(status) {
    switch(status) {
        case 'accepted':
            return {
                text: 'Friends',
                class: 'btn-success disabled',
                action: null
            };
        case 'pending':
            return {
                text: 'Pending',
                class: 'btn-secondary disabled',
                action: null
            };
        default:
            return {
                text: 'Add Friend',
                class: 'btn-outline-primary',
                action: 'sendFriendRequest'
            };
    }
}

window.sendFriendRequest = async function(userId) {
    const button = document.querySelector(`button[data-user-id="${userId}"]`);
    if (!button) return;

    try {
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

        const response = await fetch('http://localhost:8000/user/friends/send/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenService.getAccessToken()}`
            },
            body: JSON.stringify({ id: userId })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to send friend request');
        }

        showAlert('Friend request sent successfully', 'success');
        updateButtonStatus(button, 'pending');

    } catch (error) {
        console.error('Error:', error);
        showAlert(error.message || 'Failed to send friend request', 'danger');
        updateButtonStatus(button, 'none');
    }
}

function updateButtonStatus(button, status) {
    const config = getFriendButtonConfig(status);
    button.innerHTML = config.text;
    button.className = `btn btn-sm ${config.class}`;
    button.disabled = !config.action;

    if (config.action) {
        button.setAttribute('onclick', `event.stopPropagation(); ${config.action}('${button.dataset.userId}')`);
    } else {
        button.removeAttribute('onclick');
    }
}
