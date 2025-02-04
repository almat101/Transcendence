export function showWinningScreen(winner, restartGameCallback) {
	const winningScreen = document.getElementById('winningScreen');
	const winnerMessage = document.getElementById('winnerMessage');
	const restartButton = document.getElementById('restartButton');

	if (winnerMessage == null)
	{
		//there is a problem when the game is started and the route is changed, winnerMessage is null
		console.log("lol");
		return ;
	}
	else
	{
		winnerMessage.textContent = `${winner} wins!`;
		winningScreen.style.display = 'block';

		restartButton.addEventListener('click', () => {
			winningScreen.style.display = 'none';
			restartGameCallback();
		});

	}
  }
