import { tokenService } from '../services/authService.js';

export async function create_local_game(player1_id,player1_name,player2_name,player1_score,player2_score,winner, is_tournament) {
	try {
		const response = await fetch('/api/history/match/create', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${tokenService.getAccessToken()}`
			},
			body: JSON.stringify({
				player1_id: player1_id,
				player1_name: player1_name,
				player2_name: player2_name,
				player1_score: player1_score,
				player2_score: player2_score,
				winner: winner,
				is_tournament: is_tournament
			})
		});

		if (!response.ok) {
			let errorData;
			try {
				errorData = await response.json();
			} catch (jsonError) {
				throw new Error('Failed to save local game data. Server returned non-JSON response.');
			}
			throw new Error(errorData.error || 'Failed to save local game data.');
		}
		// alert('Local match data saved successfully!');
	} catch (error) {
		console.log("Error saving Local game data.", error);
	}
};


export async function create_tournament_game(player1_id,total_players, user_final_position) {
	try {
		const response = await fetch('/api/history/tournament/create', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${tokenService.getAccessToken()}`
			},
			body: JSON.stringify({
				player1_id: player1_id,
				total_players: total_players,
				user_final_position: user_final_position
			})
		});

		if (!response.ok) {
			let errorData;
			try {
				errorData = await response.json();
			} catch (jsonError) {
				throw new Error('Failed to save tournament game data. Server returned non-JSON response.');
			}
			throw new Error(errorData.error || 'Failed to save tournament game data.');
		}
		// alert('Tournament data saved successfully!');
	} catch (error) {
		console.log("Error saving tournament game data.", error);
	}
};



export async function get_local_matches() {
	try {
		const response = await fetch('/api/history/match/', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${tokenService.getAccessToken()}`
			}
		});
		if (!response.ok) {
			let errorData;
			try {
				errorData = await response.json();
			} catch (jsonError) {
				throw new Error('Failed to get local game data. Server returned non-JSON response.');
			}
			throw new Error(errorData.error || 'Failed to get local game data.');
		}
		// alert('Getting local matches successfully!');
		const local_matches = await response.json()
		console.log("local matches: ", local_matches)
		return local_matches;
	} catch (error) {
		console.log("Error getting Local game data.", error);
	}
};


export async function get_local_tournament() {
	try {
		const response = await fetch('/api/history/tournament/', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${tokenService.getAccessToken()}`
			}
		});
		if (!response.ok) {
			let errorData;
			try {
				errorData = await response.json();
			} catch (jsonError) {
				throw new Error('Failed to get tournament game data. Server returned non-JSON response.');
			}
			throw new Error(errorData.error || 'Failed to save tournament game data.');
		}
		// alert('Getting local tournament successfully!');
		const local_tournament = await response.json()
		console.log("local tournament: ", local_tournament)
		return local_tournament;
	} catch (error) {
		console.log("Error getting tournament game data.", error);
	}
};


export async function get_local_matches_by_player(player1_id) {
	try {
		const response = await fetch(`/api/history/match/${player1_id}/`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${tokenService.getAccessToken()}`
			}
		});
		if (!response.ok) {
			let errorData;
			try {
				errorData = await response.json();
			} catch (jsonError) {
				throw new Error('Failed to get local match by player data. Server returned non-JSON response.');
			}
			throw new Error(errorData.error || 'Failed to get local game by player data.');
		}
		// alert('Getting local matches successfully!');
		const local_matches = await response.json()
		console.log("local matches by player: ", local_matches)
		return local_matches;
	} catch (error) {
		console.log("Error getting Local game by player data.", error);
	}
};


export async function get_local_tournament_by_player(player1_id) {
	try {
		const response = await fetch(`/api/history/tournament/${player1_id}/`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${tokenService.getAccessToken()}`
			}
		});
		if (!response.ok) {
			let errorData;
			try {
				errorData = await response.json();
			} catch (jsonError) {
				throw new Error('Failed to get tournament by player game data. Server returned non-JSON response.');
			}
			throw new Error(errorData.error || 'Failed to get tournament by player game data.');
		}
		// alert('Getting local tournament successfully!');
		const local_tournament = await response.json()
		console.log("local tournament by player: ", local_tournament)
		return local_tournament;
	} catch (error) {
		console.log("Error getting tournament game by player data.", error);
	}
};
