//I import the code from the other
//files that are needed to make the game work
import { showWinningScreen } from './winningScreen.js';
import { gameLoop } from './gameLoop.js';
import { showMenu } from './menu.js';
import { fetchMatches, fetchAllUsers, saveUsers, deleteUser, deleteAllUsers } from './backendFront.js';
import { userService } from '../services/userService.js';
import { create_local_game, update_tournament, create_tournament } from './history.js';

let gameMode = '1v1'; // Default mode
let tournamentMatches = []; // Store tournament matches

//*tournament data
let user_final_position = 0;
let total_players = 0;
let check_lost = false;

//*global ID of the tournament
let tournamentId = null;

export async function initializeGame(navbar) {
	//!moved inside the initialize game to avoid error
	const userData = userService.getUserData();
	console.log("initizalizing game");
	//this is the calssic setup done to make the tournament part avaible
	// showMenu(start1v1Game, startTournament, startCpuGame);
	// If these elements exist in your rendered HTML, you can attach event listeners.
	const playerNamesForm = document.getElementById('playerNamesForm');
	if (playerNamesForm) {
		playerNamesForm.addEventListener('submit', async (event) => {
			event.preventDefault();
			const names = document.getElementById('playerNames')
				.value.split(',')
				.map(name => name.trim())
				.filter(name => name);
				//* we add the logged user in the tournament as well
				names.push(userData.username);
			const deleteSuccess = await deleteAllUsers();
			if(deleteSuccess) {
				saveUsers(names, startTournament);
				//!cambiato
				user_final_position = names.length;
				total_players = names.length;
			}
			else {
				console.log("failed");
			}
		});
	}

	showMenu(start1v1Game, startTournament, startCpuGame);
	// Attach other event listeners (make sure the referenced elements exist)
	const cancelTournamentSetup = document.getElementById('cancelTournamentSetup');
	if (cancelTournamentSetup) {
		cancelTournamentSetup.addEventListener('click', () => {
			document.getElementById('tournamentSetup').style.display = 'none';
			showMenu(start1v1Game, startTournament, startCpuGame);
		});
	}

	const deleteUserBtn = document.getElementById('deleteUserButton');
	if (deleteUserBtn) {
		deleteUserBtn.addEventListener('click', async () => {
			if (confirm('Are you sure you want to delete ALL users from the DB?')) {
				const success = await deleteAllUsers();
				if (success) {
					const setupForm = document.getElementById('playerNamesForm');
					if (setupForm) {
						setupForm.reset();
						document.getElementById('tournamentSetup').style.display = 'none';
					}
					showMenu(start1v1Game, startTournament, startCpuGame);
				}
			}
		});
	}

	// Attach event listeners for game buttons
	// const startButton = document.getElementById('startGameButton');
	// if (startButton) {
	//   startButton.addEventListener('click', start1v1Game);
	// }

	// const tournamentButton = document.getElementById('tournamentButton');
	// if (tournamentButton) {
	//   tournamentButton.addEventListener('click', tournamentSetup());
	// }

	// const cpuButton = document.getElementById('cpuButton');
	// if (cpuButton) {
	//   cpuButton.addEventListener('click', startCpuGame);
	// }


	async function start1v1Game() {

		console.log('Starting 1v1 Game');
		if (navbar)
			navbar.style.display = 'none';

		gameMode = '1v1';

		const player1Name = userData.username;
		// const player1_id = userData.id;

		const player2Name = 'guest';

		const canvas = document.getElementById('gameCanvas');
		const scores = document.getElementById('scores');

		scores.style.display = 'block';
		canvas.style.display = 'block';
		// buttonsHandler(startButton, cpuButton, tournamentButton, false);
		// Start normal game loop (both paddles controlled by keyboard)
		gameLoop(canvas, endGame, player1Name, player2Name);
	}

	function startCpuGame() {
		console.log('Starting Game Against CPU');
		if (navbar)
			navbar.style.display = 'none';
		gameMode = 'cpu';
		//*change
		const player1Name = userData.username;
		const player2Name = 'CPU';
		const canvas = document.getElementById('gameCanvas');
		const scores = document.getElementById('scores');
		scores.style.display = 'block';
		canvas.style.display = 'block';

		// buttonsHandler(startButton, cpuButton, tournamentButton, false);
		// Pass an extra flag (true) to enable CPU logic in gameLoop
		gameLoop(canvas, endGame, player1Name, player2Name, true);
	}

	// startTournament remains unchanged...
	async function startTournament() {
		const player1_id = userData.id;
		//! if create_tournament fail(database down) we exit from the start tournament and we show the menu
		try {
			//* Creating tournament with 0 total_player, taking the new tournamentId from the response to link all tournament match 1vs1 to a tournament
			tournamentId = await create_tournament(tournamentId, player1_id);
			if (!tournamentId) {
				throw new Error('Failed to create tournament');
			}
		} catch (error) {
			console.error("Error creating tournament:", error);
			alert('Failed to create tournament. Please try again.');
			showMenu(start1v1Game, startTournament, startCpuGame);
			return;
		}
		if (navbar)
			navbar.style.display = 'none';

		gameMode = 'tournament';
		const canvas = document.getElementById('gameCanvas');
		const scores = document.getElementById('scores');
		tournamentMatches = await fetchMatches();
		// buttonsHandler(startButton, cpuButton, tournamentButton, false);
		if (!tournamentMatches.length) {
			alert('No matches available for the tournament.');
			//! aggiunto
			navbar.style.display = 'block';
			//!cambiato
			deleteAllUsers();
			showMenu(start1v1Game, startTournament, startCpuGame);
			return;
		}
		playTournamentMatch(tournamentMatches.shift());
	}

	function playTournamentMatch(match) {
		console.log("starting tournament with this matchup");
		const { player1, player2 } = match;
		const matchAnnouncement = document.getElementById('matchAnnouncement');
		const matchAnnouncementText = document.getElementById('matchAnnouncementText');
		const startMatchButton = document.getElementById('startMatchButton');
		const gameCanvas = document.getElementById('gameCanvas');
		const scores = document.getElementById('scores');

		matchAnnouncementText.textContent = `${player1} vs ${player2}`;
		matchAnnouncement.style.display = 'block';
		gameCanvas.style.display = 'none';
		scores.style.display = 'none';

		startMatchButton.onclick = () => {
		matchAnnouncement.style.display = 'none';
		gameCanvas.style.display = 'block';
		scores.style.display = 'block';
		// Start the game loop with the tournament endGame callback
		gameLoop(gameCanvas, (winner) => endTournamentMatch(winner, player1, player2), player1, player2);
		};
	}

	async function endTournamentMatch(winner, player1, player2) {
		// Hide the canvas before alerting:
		const gameCanvas = document.getElementById('gameCanvas');
		const scores = document.getElementById('scores');
		const scoreText = scores.textContent;
		//we use \d+ to match all the digits in the string
		//! changeed to parse only 1 digit after :
		const scoreMatches = scoreText.match(/(?<=:\s*)\d/g);
		const player1_score = parseInt(scoreMatches[0]);
		const player2_score = parseInt(scoreMatches[1]);
		gameCanvas.style.display = 'none';
		scores.style.display = 'none';

		const loser = (winner === player1) ? player2 : player1;
		alert(`${winner} is victorious! Eliminating ${loser} from the tournament.`);

		//*Creating payload for POST
		const player1_id = userData.id;
		const is_tournament = true;

		const tournament_1vs1_payload = {
			player1_id : player1_id,
			player1_name : player1,
			player2_name : player2,
			player1_score : player1_score,
			player2_score : player2_score,
			winner : winner,
			is_tournament : is_tournament,
			tournament : tournamentId
		}

		//*POST for creating every 1vs1 tournament games
		try {
			await create_local_game(tournament_1vs1_payload);
		} catch (error) {
			console.error("Error creating tournament local game 1vs1:", error);
			alert('Failed to create local game. Please try again.');
			return;
		}
		//? this for now is the simpler version of the tournament positining
		//!cambiato
		if (loser == userData.username)
			check_lost = true;
		if (loser != userData.username && check_lost != true) {
			user_final_position -= 1;
		}
		// Delete the loser
		await deleteUser(loser);
		//update the number of users in the tournament for the final
		//position of the logged user
		// Check if all matches in the current round are played
		if (!tournamentMatches.length) {
			// Fetch remaining matches
			const remainingMatches = await fetchMatches();
			console.log("remaining matches: ", remainingMatches);
			const remainingUsers = await fetchAllUsers();
			console.log("remaining users ", remainingUsers);
			if (remainingMatches.length > 0) {
				// More matches to play, start the next match
				tournamentMatches = remainingMatches;
				playTournamentMatch(tournamentMatches.shift());
				return;
			}

			// No matches remain, check if only one user remains
			// const remainingUsers = await fetchAllUsers();

			if (remainingUsers.length === 1) {
				// Check if the remaining user is the logged user
				// if (remainingUsers[0].name === userData.username) {
				// 	loggedUserTPosition = 1;
				// }
				// Declare the remaining user as the champion
				showWinningScreen(remainingUsers[0].name, restartGame);
				//*added for next pull
				if (winner === userData.username)
					user_final_position = 1;

				//*PATCH to update the total_players and user final position
				await update_tournament(tournamentId, total_players, user_final_position)

				deleteAllUsers();
				return;
			} else if (remainingUsers.length > 1) {
			// If multiple users remain without matches, start a new round
				tournamentMatches = await fetchMatches();
				if (tournamentMatches.length > 0) {
					playTournamentMatch(tournamentMatches.shift());
					return;
				}
			}

			// If no users remain or an unexpected state occurs
			// alert('No players left in the tournament.');
			// showMenu(start1v1Game, startTournament, );
			// return;
		}

		if (tournamentMatches.length) {
			playTournamentMatch(tournamentMatches.shift());
		}
	}
	async function endGame(winner) {
		console.log('End Game:', winner);
		if (gameMode === '1v1' || gameMode === 'cpu') {
			const canvas = document.getElementById('gameCanvas');
			const scores = document.getElementById('scores');
			const scoreText = scores.textContent;
			//we use \d+ to match all the digits in the string
			//! change this to parse match only after :  ex lol3434 : 3 has to take 3
			const scoreMatches = scoreText.match(/(?<=:\s*)\d/g);
			const player1_score = parseInt(scoreMatches[0]);
			const player2_score = parseInt(scoreMatches[1]);
			//*logged user has won the game now we use winner
			// const logged_user_has_won = winner === userData.username;
			const winningScreen = document.getElementById('winningScreen');
			const winnerMessage = document.getElementById('winnerMessage');
			const restartButton = document.getElementById('restartButton');

			canvas.style.display = 'none';
			scores.style.display = 'none';
			winnerMessage.textContent = `${winner} wins!`;
			winningScreen.style.display = 'block';

			if (gameMode === '1v1'){
				const player2_name = "guest";
				const player1_id = userData.id;
				const player1_name = userData.username;

				//*Creating local game payload for the POST
				const local_1vs1_payload = {
					player1_id : player1_id,
					player1_name : player1_name,
					player2_name : player2_name,
					player1_score : player1_score,
					player2_score : player2_score,
					winner : winner
				}

				try {
					await create_local_game(local_1vs1_payload);
				} catch (error) {
					console.error("Error creating local game 1vs1:", error);
					alert('Failed to create local game. Please try again.');
					return;
				}
			}
			//* tournament history api call end

			restartButton.onclick = () => {
				winningScreen.style.display = 'none';
				showMenu(start1v1Game, startTournament, startCpuGame);
				// buttonsHandler(startButton, cpuButton, tournamentButton, true);
				navbar.style.display = 'block';
			};
		}


	}

	function restartGame() {
		console.log('Restarting Game');
		//!nicoter removed this 4 lines, navbar block is needed
		navbar.style.display = 'block';
		// const player1ScoreElement = document.getElementById('player1Score');
		// const player2ScoreElement = document.getElementById('player2Score');
		// player1ScoreElement.textContent = 'Player 1: 0';
		// player2ScoreElement.textContent = 'Player 2: 0';
		//!strange but true this works? BUT i need to analyze properly the
		//!the part where i should show case the winner of the tournament or am i dumb?
		showMenu(start1v1Game, startTournament, startCpuGame);
	}
}


/*
*Task di oggi di revisione e per aggiustare le cose a livello
*organizzativo:
	// vincitore del 1vs1 [X]
	TODO: sistemare il github di django, avendo la modalità (no priorità)
		TODO: torneo non funzionante

	//  Revisionare algoritmo della CPU ora come ora non va bene com'è fatto [X]

	// * fare schermata di vittoria per locale amatta c'è già
	// salvare scores per 1vs1 di amatta, fare la conversione a modo [X]
	// per il torneo posizione [X] e numero utenti [X]
*/
