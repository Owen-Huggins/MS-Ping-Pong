// public/js/app.js
document.getElementById('gameForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const playerA = document.getElementById('playerA').value.trim();
    const scoreA = parseInt(document.getElementById('scoreA').value, 10);
    const playerB = document.getElementById('playerB').value.trim();
    const scoreB = parseInt(document.getElementById('scoreB').value, 10);
    
    const payload = { playerA, playerB, scoreA, scoreB };
  
    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        // Redirect to leaderboard after recording game
        window.location.href = '/leaderboard.html';
      } else {
        const data = await response.json();
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Error submitting game result.');
    }
  });
  