import { Navbar } from "../components/navbar.js";
import { showAlert } from '../components/alert.js';
import { get_local_matches_by_player, get_local_tournament_by_player } from '../pong/history.js';
import { userService } from "../services/userService.js";

export async function renderProfilePage() {
    const userData = userService.getUserData();

    const root = document.getElementById("root");
    root.innerHTML = "";

    const navbar = Navbar();
    root.appendChild(navbar);

    const section = document.createElement('section');
    section.className = 'text-lg-start';
    section.style.paddingTop = '20px';

    const profileSection = `
        <div class="container align-items-center">
            <div id="profileSection">
                <div class="local-games-card">
                    <div class="card">
                        <div class="card-body">
                            <h3 class="card-title mb-4">Local Games</h3>
                            <table class="table table-striped" id="localGamesTable">
                                <thead>
                                    <tr>
                                        <th>Player 1</th>
                                        <th>Player 2</th>
                                        <th>Score</th>
                                        <th>Winner</th>
                                        <th>Tournament ID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Local games data will be inserted here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="tournament-games-card">
                    <div class="card">
                        <div class="card-body">
                            <h3 class="card-title mb-4">Tournament Games</h3>
                            <table class="table table-striped" id="tournamentGamesTable">
                                <thead>
                                    <tr>
                                    <th>Tournament ID</th>
                                    <th>Total Players</th>
                                    <th>User Final Position</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Tournament games data will be inserted here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;

    section.innerHTML += profileSection;
    root.appendChild(section);

    try {
        const localGames = await get_local_matches_by_player(userData.id);
        const localGamesTableBody = document.getElementById('localGamesTable').querySelector('tbody');
        localGamesTableBody.innerHTML = '';
        if (localGames.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="5">No local games found.</td>`;
            localGamesTableBody.appendChild(row);
        } else {
            localGames.forEach(game => {
                const row = document.createElement('tr');
                // <td>${game.is_tournament ? 'Yes' : 'No'}</td>
                row.innerHTML = `
                    <td class="text-center" >${game.player1_name}</td>
                    <td class="text-center">${game.player2_name}</td>
                    <td class="text-center">${game.player1_score} - ${game.player2_score}</td>
                    <td class="text-center">${game.winner}</td>
                    <td class="text-center">${game.is_tournament ? `${game.tournament}` : ' '}</td>
                `;
                localGamesTableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error fetching local games data:', error);
        showAlert('Failed to fetch local games data', 'danger');
    }

    try {
        const tournamentGames = await get_local_tournament_by_player(userData.id);
        const tournamentGamesTableBody = document.getElementById('tournamentGamesTable').querySelector('tbody');
        tournamentGamesTableBody.innerHTML = '';
        if (tournamentGames.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="4">No tournament games found.</td>`;
            tournamentGamesTableBody.appendChild(row);
        } else {
            tournamentGames.forEach(game => {
                const row = document.createElement('tr');
                row.innerHTML = `
                <td class="text-center">${game.id}</td>
                <td class="text-center">${game.total_players}</td>
                <td class="text-center">${game.user_final_position}</td>
                `;
                tournamentGamesTableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error fetching tournament games data:', error);
        showAlert('Failed to fetch tournament games data', 'danger');
    }
}
