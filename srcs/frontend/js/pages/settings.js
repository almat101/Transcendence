import { authService, tokenService } from "../services/authService.js";
import { Navbar } from "../components/navbar.js";
import { showAlert } from '../components/alert.js';
import { userService } from '../services/userService.js';
import { TwoFASetup } from '../components/TwoFA.js';

export async function renderSettingsPage() {
    let userData;

    try {
        const response = await fetch('/api/user/getuserinfo/', {
            headers: {
                'Authorization': `Bearer ${tokenService.getAccessToken()}`
            }
        });
        userData = await response.json();
    } catch (error) {
        console.error('Error fetching user data:', error);
        showAlert('Failed to fetch user data', 'danger');
    }

    const root = document.getElementById("root");
    root.innerHTML = "";

    const navbar = Navbar();
    root.appendChild(navbar);

    const section = document.createElement('section');
    section.className = 'text-lg-start';

    const settingsSection = `
        <div class="container align-items-center">
            <div id="settingsSection">
                <div class="profile-card">
                    <div class="card h-100">
                        <div class="card-body d-flex flex-column">
                            <div class="d-flex justify-content-between">
                                <h3 class="card-title mb-4">Profile Settings</h3>
                                <a">Member since: ${new Date(userData.created_at).toLocaleDateString()}</a>
                            </div>
                            <div class="text-center mb-4">
                                <div id="avatarContainer" style="position: relative; width: 100px; height: 100px; margin: 0 auto;">
                                    <div id="avatarPreview" style="width: 100px; height: 100px; border-radius: 50%; margin: 0 auto; overflow: hidden; cursor: pointer;">
                                        ${userData.avatar ? `<img src="${userData.avatar}" style="width: 100%; height: 100%; object-fit: cover;" alt="${userData.username}'s avatar">` : ''}
                                    </div>
                                    <div id="avatarOverlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 50%; background: rgba(0,0,0,0.5); color: white; display: none; justify-content: center; align-items: center; cursor: pointer;">
                                        <i class="bi bi-camera-fill"></i>
                                    </div>
                                    <input type="file" id="avatarInput" accept="image/*" style="display: none;">
                                </div>
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
                                    <input type="bio" class="form-control" id="bio" value="${userData.bio || ''}">
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

                <div class="twofa-card">
                    <div class="card">
                        <div class="card-body">
                            <h3 class="card-title mb-4">Two-Factor Authentication</h3>
                            ${userData.has_2fa ?
                                `<div class="alert alert-success">
                                    <i class="bi bi-shield-check me-2"></i> Two-factor authentication is enabled
                                </div>
                                <button id="disable2fa" class="btn btn-danger w-100 mt-3">Disable Two-Factor Authentication</button>`
                                :
                                `<p>Protect your account with two-factor authentication. When enabled, you'll need to enter a code from your authentication app when signing in.</p>
                                <button id="setup2fa" class="btn btn-primary w-100 mt-3">Enable Two-Factor Authentication</button>`
                            }
                        </div>
                    </div>
                </div>

                <div class="delete-account-card">
                    <div class="card">
                        <div class="card-body">
                            <h3 class="card-title mb-4">Delete Account</h3>
                            <p>Once you delete your account, there is no going back. Please be certain.</p>
                            <button type="button" class="btn w-100 mt-4 mb-4" id="deleteAccount" data-bs-toggle="modal" data-bs-target="#deleteAccountModal">Delete Account</button>
                        </div>
                    </div>
                </div>

                <div class="modal fade" id="deleteAccountModal" tabindex="-1" aria-labelledby="deleteAccountModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="deleteAccountModalLabel">Delete Account</h5>
                                <i class="bi bi-x-lg" data-bs-dismiss="modal" aria-label="Close"></i>
                            </div>
                            <div class="modal-body">
                                <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                                ${!userData.has_oauth ? `
                                    <div class="form-group">
                                        <label for="deleteConfirmPassword">Enter your password to confirm:</label>
                                        <input type="password" class="form-control" id="deleteConfirmPassword" required>
                                    </div>
                                ` : ''}
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-danger" id="confirmDelete">Delete Account</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `;

    section.innerHTML += settingsSection;
    root.appendChild(section);

    if (userData.has_2fa) {
        document.getElementById('disable2fa').addEventListener('click', async () => {
            // Create a modal for verification
            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.id = 'disable2faModal';
            modal.setAttribute('tabindex', '-1');

            modal.innerHTML = `
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Disable Two-Factor Authentication</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p>Please enter your authentication code to disable 2FA:</p>
                            <div class="form-group mb-3">
                                <input type="text" class="form-control" id="disableToken" placeholder="Authentication code">
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-danger" id="confirmDisable2fa">Disable 2FA</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            const modalInstance = new bootstrap.Modal(document.getElementById('disable2faModal'));
            modalInstance.show();

            document.getElementById('confirmDisable2fa').addEventListener('click', async () => {
                const token = document.getElementById('disableToken').value;
                try {
                    const response = await fetch('/api/user/2fa/disable/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${tokenService.getAccessToken()}`
                        },
                        body: JSON.stringify({ token })
                    });

                    if (response.ok) {
                        showAlert('Two-factor authentication has been disabled', 'success');
                        modalInstance.hide();
                        // Refresh page to update UI
                        window.location.reload();
                    } else {
                        const data = await response.json();
                        showAlert(data.error || 'Failed to disable 2FA', 'danger');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showAlert('Failed to disable 2FA', 'danger');
                }
            });
        });
    } else {
        document.getElementById('setup2fa').addEventListener('click', async () => {
            // Show 2FA setup modal
            TwoFASetup.show();
        });
    }

    // Add event listeners
    document.getElementById('profileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/user/updateuser/', {
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
                authService.fetchAndStoreUserData();
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
            const response = await fetch('/api/user/password-reset/', {
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

    document.getElementById('confirmDelete').addEventListener('click', async () => {
        try {
            const headers = {
                'Authorization': `Bearer ${tokenService.getAccessToken()}`
            };

            // If not OAuth user, include password
            if (!userData.has_oauth) {
                const password = document.getElementById('deleteConfirmPassword').value;
                if (!password) {
                    showAlert('Password is required', 'danger');
                    return;
                }
                headers['Content-Type'] = 'application/json';
            }

            const response = await fetch('/api/user/deleteuser/', {
                method: 'POST',
                headers: headers,
                body: !userData.has_oauth ? JSON.stringify({
                    password: document.getElementById('deleteConfirmPassword').value
                }) : undefined,
                credentials: 'include'
            });

            if (response.ok) {
                tokenService.removeTokens();
                userService.clearUserData();
                window.location.replace('/login');
            } else {
                const error = await response.json();
                showAlert(error.error || 'Failed to delete account', 'danger');
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert(error.error || 'Failed to delete account', 'danger');
        }
    });

    //avatar upload
    const avatarPreview = document.getElementById('avatarPreview');
    const avatarOverlay = document.getElementById('avatarOverlay');
    const avatarInput = document.getElementById('avatarInput');
    const avatarContainer = document.getElementById('avatarContainer');

    // Show overlay on hover
    avatarContainer.addEventListener('mouseenter', () => {
        avatarOverlay.style.display = 'flex';
    });

    avatarContainer.addEventListener('mouseleave', () => {
        avatarOverlay.style.display = 'none';
    });

    // Trigger file input on click
    avatarContainer.addEventListener('click', () => {
        avatarInput.click();
    });

    // Handle file selection
    avatarInput.addEventListener('change', async (event) => {
        if (!event.target.files.length) return;

        const file = event.target.files[0];

        // Validate file type
        if (!file.type.match('image.*')) {
            showAlert('Please select an image file', 'warning');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showAlert('File size cannot exceed 5MB', 'warning');
            return;
        }

        try {
            // Show loading indicator
            avatarPreview.innerHTML = '<div class="spinner-border text-light" style="margin: 30px auto;"></div>';
            avatarOverlay.style.display = 'none';

            const formData = new FormData();
            formData.append('avatar', file);

            const response = await fetch('/api/user/updateavatar/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${tokenService.getAccessToken()}`
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                // Update the avatar preview
                userData.avatar = data.avatar; // Update the stored user data
                userService.updateUserData({ avatar: data.avatar });
                avatarPreview.innerHTML = `<img src="${data.avatar}" style="width: 100%; height: 100%; object-fit: cover;" alt="${userData.username}'s avatar">`;
                showAlert('Avatar updated successfully', 'success');
            } else {
                throw new Error(data.error || 'Failed to update avatar');
            }
        } catch (error) {
            console.error('Error updating avatar:', error);
            showAlert(error.message, 'danger');
        }
    });
}
