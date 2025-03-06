import { tokenService } from '../services/authService.js';

export async function create_local_game(player1_id,player1_name,player2_name,player1_score,player2_score,logged_user_has_won, is_tournament) {
	try {
		const response = await fetch('/api/history/local/create', {
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
				logged_user_has_won: logged_user_has_won,
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
		alert('Data saved successfully!');
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
				throw new Error('Failed to save local game data. Server returned non-JSON response.');
			}
			throw new Error(errorData.error || 'Failed to save local game data.');
		}
		alert('Data saved successfully!');
	} catch (error) {
		console.log("Error saving Local game data.", error);
	}
};
