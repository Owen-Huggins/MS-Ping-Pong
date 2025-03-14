const backendUrl = 'https://ms-ping-pong.onrender.com'; // Replace with your actual backend URL

// Function to fetch player details
async function loadPlayerDetails(playerName) {
    try {
        const response = await fetch(`${backendUrl}/api/player/${encodeURIComponent(playerName)}`);
        if (!response.ok) {
            throw new Error('Player not found');
        }
        const player = await response.json();
        document.querySelector('#player-name').textContent = player.name;
        document.querySelector('#player-elo').textContent = player.elo;
        document.querySelector('#player-wins').textContent = player.wins;
        document.querySelector('#player-losses').textContent = player.losses;

        const matchesList = document.querySelector('#player-matches');
        matchesList.innerHTML = '';
        player.matches.forEach(match => {
            const li = document.createElement('li');
            li.textContent = `vs ${match.opponent} | Score: ${match.score} - ${match.opponentScore} | Date: ${new Date(match.date).toLocaleDateString()}`;
            matchesList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading player details:', error);
        document.querySelector('#error-message').textContent = 'Player not found!';
    }
}

// Get player name from URL and load details
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const playerName = urlParams.get('name');
    if (playerName) {
        loadPlayerDetails(playerName);
    }
});
