import { tokenService } from "../services/authService.js";
import { Navbar } from "../components/navbar.js";
import { showAlert } from '../components/alert.js';

export async function renderSettingsPage() {
    const root = document.getElementById("root");
    root.innerHTML = "";

    const navbar = Navbar();
    root.appendChild(navbar);

    const section = document.createElement('section');
    section.className = 'text-lg-start';

    // Fetch current user data
    try {
        const response = await fetch('http://localhost:8000/user/getuserinfo/', {
            headers: {
                'Authorization': `Bearer ${tokenService.getAccessToken()}`
            }
        });
        const userData = await response.json();

        // Create profile section
        const profileSection = `
        <div class="container align-items-center">
            <div id="profileSection">
                <div class="profile-card">
                    <div class="card h-100">
                        <div class="card-body d-flex flex-column">
                            <div class="d-flex justify-content-between">
                                <h3 class="card-title mb-4">Profile Settings</h3>
                                <a">Member since: ${new Date(userData.created_at).toLocaleDateString()}</a>
                            </div>
                            <div class="text-center mb-4">
                                <div id="avatarPreview" style="width: 100px; height: 100px; border-radius: 50%; background-color: ${userData.avatar_color || '#0d6efd'}; margin: 0 auto;"></div>
                            </div>

                            <form id="profileForm" class="flex-grow-1 d-flex flex-column">
                                <div class="mb-3">
                                    <label class="form-label">Username</label>
                                    <input type="text" class="form-control" id="username" value="${userData.username || ''}" required>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-control" id="email" value="${userData.email || ''}" required>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">Bio</label>
                                    <input type="bio" class="form-control" id="bio" value="${userData.bio || ''}" required>
                                </div>

                                <button type="submit" class="btn btn-primary w-100 mt-4 mb-4">Update Profile</button>
                            </form>
                        </div>
                    </div>
                </div>

                <div class="password-card">
                    <div class="card">
                        <div class="card-body">
                            <h3 class="card-title mb-4">Change Password</h3>
                            <form id="passwordForm">
                                <div class="mb-3">
                                    <label class="form-label">Current Password</label>
                                    <input type="password" class="form-control" id="currentPassword" required>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">New Password</label>
                                    <input type="password" class="form-control" id="newPassword" required>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">Re-type New Password</label>
                                    <input type="password" class="form-control" id="confirmPassword" required>
                                </div>

                                <button type="submit" class="btn btn-primary w-100  mt-4 mb-4">Update Password</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;

        section.innerHTML += profileSection;
        root.appendChild(section)

        // Add event listeners
        document.getElementById('profileForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            try {
                const response = await fetch('http://localhost:8000/user/updateuser/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${tokenService.getAccessToken()}`
                    },
                    body: JSON.stringify({
                        username: document.getElementById('username').value,
                        email: document.getElementById('email').value,
                        bio: document.getElementById('bio').value
                    })
                });

                if (response.ok) {
                    showAlert('Profile updated successfully', 'success');
                } else {
                    const error = await response.json();
                    showAlert(error.error || 'Failed to update profile', 'danger');
                }
            } catch (error) {
                console.error('Error:', error);
                showAlert(error.error || 'Failed to update profile', 'danger');
            }
        });

        document.getElementById('passwordForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            try {
                if (document.getElementById('confirmPassword').value !== document.getElementById('newPassword').value) {
                    showAlert('Passwords do not match');
                    return;
                }
                const response = await fetch('http://localhost:8000/user/password-reset/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${tokenService.getAccessToken()}`
                    },
                    body: JSON.stringify({
                        old_password: document.getElementById('currentPassword').value,
                        new_password: document.getElementById('newPassword').value,
                        confirm_password: document.getElementById('confirmPassword').value
                    })
                });

                if (response.ok) {
                    showAlert('Password updated successfully', 'success');
                    document.getElementById('passwordForm').reset();
                } else {
                    const error = await response.json();
                    showAlert(error.error || 'Failed to update password', 'danger');
                }
            } catch (error) {
                console.error('Error:', error);
                showAlert(error.error || 'Failed to update password', 'danger');
            }
        });

    } catch (error) {
        console.error('Error fetching user data:', error);
        showAlert('Failed to fetch user data', 'danger');
    }
}
