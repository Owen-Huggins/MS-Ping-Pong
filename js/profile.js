// public/js/profile.js
async function loadProfile() {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');
    if (!name) {
      alert('No player specified');
      return;
    }
    try {
      const response = await fetch(`/api/player/${encodeURIComponent(name)}`);
      if (!response.ok) {
        alert('Player not found');
        return;
      }
      const player = await response.json();
      document.getElementById('playerName').textContent = player.name;
      document.getElementById('elo').textContent = player.elo;
      document.getElementById('wins').textContent = player.wins;
      document.getElementById('losses').textContent = player.losses;
      const matchesList = document.getElementById('matches');
      matchesList.innerHTML = '';
      if (player.matches && player.matches.length > 0) {
        // Show the last 5 matches (most recent first)
        player.matches.slice(-5).reverse().forEach(match => {
          const li = document.createElement('li');
          li.textContent = `Vs ${match.opponent}: ${match.score}-${match.opponentScore} on ${new Date(match.date).toLocaleString()}`;
          matchesList.appendChild(li);
        });
      } else {
        matchesList.innerHTML = '<li>No recent matches</li>';
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }
  
  document.addEventListener('DOMContentLoaded', loadProfile);
  