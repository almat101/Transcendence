const API_URL = 'http://127.0.0.1:8000';  // Ensure this matches your backend URL

// Fetch all matches from the backend
export async function fetchMatches() {
	try {
		const response = await fetch(`${API_URL}/api/users/`);
		console.log("Fetch Response:", response);
		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || 'Failed to fetch matches.');
		}
		const matches = await response.json();
		console.log('Fetched Matches:', matches);
		return matches;
	} catch (error) {
		console.error('Error fetching matches:', error);
		alert(`Error fetching matches: ${error.message}`);
		return [];
	}
}

// Save users to the backend
export async function saveUsers(names, afterSaveCallback) {
	try {
		console.log("Saving Users:", names);
		const response = await fetch(`${API_URL}/api/users/save/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ names }),
		});
		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || 'Failed to save users.');
		}
		alert('Users saved successfully!');

		// HIDE tournament button & setup form after saving
		const startTournamentBtn = document.getElementById('startTournamentButton');
		if (startTournamentBtn) startTournamentBtn.style.display = 'none';
		const setupForm = document.getElementById('tournamentSetup');
		if (setupForm) setupForm.style.display = 'none';

		if (afterSaveCallback) afterSaveCallback();
	} catch (error) {
		console.error('Error saving users:', error);
		alert(`Failed to save users: ${error.message}`);
	}
}

// Delete a user (loser) from the backend
export async function deleteUser(loserName) {
	try {
		const response = await fetch(`${API_URL}/api/users/delete/`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ names: [loserName] }),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || 'Failed to delete user.');
		}

		const remainingUsers = await response.json();
		console.log('Remaining Users:', remainingUsers);
	} catch (error) {
		console.error('Error deleting user:', error);
		alert(`Failed to delete user: ${error.message}`);
	}
}

export async function deleteAllUsers() {
	try {
		const response = await fetch(`${API_URL}/api/users/delete_all/`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || 'Failed to delete all users.');
		}
		alert('All users were deleted successfully.');
		// Return a success flag
		return true;
	} catch (error) {
		console.error('Error deleting all users:', error);
		alert(`Failed to delete all users: ${error.message}`);
		return false;
	}
}

export async function fetchAllUsers() {
	try {
		const response = await fetch(`${API_URL}/api/users/list/`);
		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || 'Failed to fetch all users.');
		}
		const users = await response.json();
		console.log('Fetched All Users:', users);
		return users;
	} catch (error) {
		console.error('Error fetching all users:', error);
		alert(`Error fetching all users: ${error.message}`);
		return [];
	}
}
