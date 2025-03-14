// public/js/leaderboard.js
async function loadLeaderboard() {
    try {
      const response = await fetch('/api/leaderboard');
      const players = await response.json();
      const tbody = document.querySelector('#leaderboard tbody');
      tbody.innerHTML = '';
      players.forEach(player => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><a href="/profile.html?name=${encodeURIComponent(player.name)}">${player.name}</a></td>
          <td>${player.elo}</td>
          <td>${player.wins}</td>
          <td>${player.losses}</td>
        `;
        tbody.appendChild(row);
      });
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  }
  
  document.addEventListener('DOMContentLoaded', loadLeaderboard);
  