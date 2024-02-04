// Game.js
import React, { useState, useEffect } from 'react';
import Board from './Board';
import Ship from './Ship';
import Scoreboard from './Scoreboard';
import TurnIndicator from './TurnIndicator';



const BOARD_SIZE = 10;
const SHIP_LENGTH = 3;
const NUM_SHIPS = 2;

function generateEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => ({
      isShip: false,
      isHit: false,
    }))
  );
}

function placeShipsRandomly(board) {
  for (let shipIndex = 0; shipIndex < NUM_SHIPS; shipIndex++) {
    let validPlacement = false;
    while (!validPlacement) {
      const randomRow = Math.floor(Math.random() * BOARD_SIZE);
      const randomCol = Math.floor(Math.random() * BOARD_SIZE);

      const isHorizontal = Math.random() < 0.5;

      if (isHorizontal && randomCol + SHIP_LENGTH <= BOARD_SIZE) {
        validPlacement = true;
        for (let i = 0; i < SHIP_LENGTH; i++) {
          board[randomRow][randomCol + i].isShip = true;
        }
      } else if (!isHorizontal && randomRow + SHIP_LENGTH <= BOARD_SIZE) {
        validPlacement = true;
        for (let i = 0; i < SHIP_LENGTH; i++) {
          board[randomRow + i][randomCol].isShip = true;
        }
      }
    }
  }
}

function Game() {
  const [board, setBoard] = useState(generateEmptyBoard());
  const [isGameOver, setIsGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [player1, setPlayer1] = useState({
    hits: 0,
    misses: 0,
    remainingShips: NUM_SHIPS,
  });
  const [player2, setPlayer2] = useState({
    hits: 0,
    misses: 0,
    remainingShips: NUM_SHIPS,
  });
  const [currentPlayer, setCurrentPlayer] = useState(1);


  useEffect(() => {
    const newBoard = [...board];
    placeShipsRandomly(newBoard);
    setBoard(newBoard);
  }, []);

  const handleCellClick = (rowIndex, colIndex) => {
    if (isGameOver) return;

    const cell = board[rowIndex][colIndex];
    if (!cell.isHit) {
      const newBoard = [...board];
      newBoard[rowIndex][colIndex].isHit = true;

      if (cell.isShip) {
        setMessage('Hit!');
        const isAllShipsSunk = newBoard
          .flat()
          .filter(cell => cell.isShip)
          .every(shipCell => shipCell.isHit);
        if (isAllShipsSunk) {
          setMessage('Congratulations! You sank all ships.');
          setIsGameOver(true);
        }
      } else {
        setMessage('Miss!');
      }

      setBoard(newBoard);
    }
  };

  const resetGame = () => {
    const newBoard = generateEmptyBoard();
    placeShipsRandomly(newBoard);
    setBoard(newBoard);
    setIsGameOver(false);
    setMessage('');
  };

  return (
    <div className="game">
      <h1>Battleships Game</h1>
      <Scoreboard player1={player1} player2={player2} />
      <TurnIndicator currentPlayer={currentPlayer} />


      <div className="message">{message}</div>
      <Board board={board} handleCellClick={handleCellClick} disabled={isGameOver} />
      <div className="ship-container">
        <Ship length={SHIP_LENGTH} />
      </div>
      <button className="reset-button" onClick={resetGame}>
        Reset Game
      </button>
    </div>
  );
}

export default Game;
