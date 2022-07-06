const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

let boardArr = Array(9).fill(null);
let currentPlayer = 'X';

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

let winner = null;


io.on('connection', (socket) => {
  socket.join("game01");

  socket.emit('updateBoard', boardArr);

  socket.on('play', (index) => {
    boardArr[index] = currentPlayer;
    io.to("game01").emit('updateBoard', boardArr);
    currentPlayer = currentPlayer === 'O' ? 'X' : 'O';
    
    winner = calculateWinner(boardArr);
    if (winner) {
      io.to("game01").emit('winner', winner);
      boardArr = Array(9).fill(null);
    }
  })

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(3333, () => {
  console.log('listening on *:3333');
});