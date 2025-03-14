export function showWinningScreen(winner, restartGameCallback) {
	const winningScreen = document.getElementById('winningScreen');
	const winnerMessage = document.getElementById('winnerMessage');
	const restartButton = document.getElementById('restartButton');

	console.log("a final winner is found !!!");
	winnerMessage.textContent = `${winner} wins!`;
	winningScreen.style.display = 'block';

	restartButton.addEventListener('click', () => {
		winningScreen.style.display = 'none';
		restartGameCallback();
	});
}
