// server.js


const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const DATA_FILE = path.join(__dirname, 'data.json');
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Helper functions to load and save JSON data
function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ players: {} }, null, 2));
  }
  const data = fs.readFileSync(DATA_FILE);
  return JSON.parse(data);
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Elo calculation function (using K=32 by default)
function calculateElo(ratingA, ratingB, scoreA, K = 32) {
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  const newRatingA = ratingA + K * (scoreA - expectedA);
  return Math.round(newRatingA);
}

const backendUrl = 'https://ms-ping-pong.onrender.com'; // Replace with the actual backend URL

async function loadLeaderboard() {
    try {
        const response = await fetch(`${backendUrl}/api/leaderboard`);
        const players = await response.json();
        const tbody = document.querySelector('#leaderboard tbody');
        tbody.innerHTML = '';
        players.forEach(player => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><a href="profile.html?name=${encodeURIComponent(player.name)}">${player.name}</a></td>
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


// GET player details
app.get('/api/player/:name', (req, res) => {
  const data = loadData();
  const player = data.players[req.params.name];
  if (player) {
    res.json({ name: req.params.name, ...player });
  } else {
    res.status(404).json({ error: 'Player not found' });
  }
});

// POST game result
// Expected request body: { playerA: 'nameA', playerB: 'nameB', scoreA: number, scoreB: number }
app.post('/api/game', (req, res) => {
  const { playerA, playerB, scoreA, scoreB } = req.body;
  if (typeof playerA !== 'string' || typeof playerB !== 'string' ||
      typeof scoreA !== 'number' || typeof scoreB !== 'number') {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const data = loadData();

  // Initialize players if they don't exist
  if (!data.players[playerA]) {
    data.players[playerA] = { elo: 1000, wins: 0, losses: 0, matches: [] };
  }
  if (!data.players[playerB]) {
    data.players[playerB] = { elo: 1000, wins: 0, losses: 0, matches: [] };
  }

  // Determine result (win/loss/tie)
  let resultA, resultB;
  if (scoreA > scoreB) {
    resultA = 1;
    resultB = 0;
    data.players[playerA].wins++;
    data.players[playerB].losses++;
  } else if (scoreA < scoreB) {
    resultA = 0;
    resultB = 1;
    data.players[playerB].wins++;
    data.players[playerA].losses++;
  } else {
    resultA = 0.5;
    resultB = 0.5;
  }

  // Update Elo ratings
  const oldEloA = data.players[playerA].elo;
  const oldEloB = data.players[playerB].elo;
  const newEloA = calculateElo(oldEloA, oldEloB, resultA);
  const newEloB = calculateElo(oldEloB, oldEloA, resultB);
  data.players[playerA].elo = newEloA;
  data.players[playerB].elo = newEloB;

  // Record the match details
  const matchRecordA = { opponent: playerB, score: scoreA, opponentScore: scoreB, date: new Date() };
  const matchRecordB = { opponent: playerA, score: scoreB, opponentScore: scoreA, date: new Date() };
  data.players[playerA].matches.push(matchRecordA);
  data.players[playerB].matches.push(matchRecordB);

  saveData(data);
  res.json({ message: 'Game recorded', playerA: { name: playerA, newElo: newEloA }, playerB: { name: playerB, newElo: newEloB } });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
