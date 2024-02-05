// Game.js
import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  ShipContainer,
  Ship,
  Cell,
  Message,
  ResetButton,
  TurnIndicator,
  ScoreboardContainer,
  PlayerScore,
} from './StyledComponents';
import ShipDrag from './ShipDrag';
import Scoreboard from './Scoreboard';
import Board from './Board';

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
    setBoard(newBoard);
  }, []);

  const handleCellClick = (rowIndex, colIndex) => {
    if (isGameOver || board[rowIndex][colIndex].isHit) return;
  
    const cell = board[rowIndex][colIndex];
    const newBoard = [...board];
  
    if (cell.isShip) {
      // It's a hit!
      newBoard[rowIndex][colIndex].isHit = true;
      setMessage('Hit!');
  
      const isAllShipsSunk = newBoard
        .flat()
        .filter(cell => cell.isShip)
        .every(shipCell => shipCell.isHit);
  
      if (isAllShipsSunk) {
        setMessage('Congratulations! You sank all ships.');
        setIsGameOver(true);
      }
  
      // Update player stats
      setCurrentPlayerStats(currentPlayerStats => ({
        ...currentPlayerStats,
        hits: currentPlayerStats.hits + 1,
      }));
    } else {
      // It's a miss
      newBoard[rowIndex][colIndex].isHit = true;
      setMessage('Miss!');
  
      // Update player stats
      setCurrentPlayerStats(currentPlayerStats => ({
        ...currentPlayerStats,
        misses: currentPlayerStats.misses + 1,
      }));
    }
  
    // Switch turns
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
  
    // Simulate computer player's move (if it's computer's turn)
    if (currentPlayer === 2 && !isGameOver) {
      setTimeout(() => {
        // Implement computer player's move logic here
        const computerMove = getComputerMove(); // Replace with your logic
        handleCellClick(computerMove.rowIndex, computerMove.colIndex);
      }, 1000); // Add a delay to simulate computer's "thinking" time
    }
  };
  

  const resetGame = () => {
    // Reset the game board
    const newBoard = generateEmptyBoard();
    placeShipsRandomly(newBoard); // Assuming you have a function to place ships
    setBoard(newBoard);
  
    // Reset game-related state
    setIsGameOver(false);
    setMessage('');
  
    // Reset player stats
    setPlayer1({
      hits: 0,
      misses: 0,
      remainingShips: NUM_SHIPS,
    });
  
    setPlayer2({
      hits: 0,
      misses: 0,
      remainingShips: NUM_SHIPS,
    });
  
    // Reset current player and stats
    setCurrentPlayer(1);
    setCurrentPlayerStats({
      hits: 0,
      misses: 0,
      remainingShips: NUM_SHIPS,
    });
  
    // Optionally, you can add a delay before starting the new game
    setTimeout(() => {
      setMessage('New game started. Your turn!');
    }, 1000);
  };
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div>
      <DndProvider backend={HTML5Backend}>
      <div>
        <h1>Battleships Game</h1>
        <TurnIndicator currentPlayer={currentPlayer} />
        <ScoreboardContainer>
          <PlayerScore>
            <h2>Player 1</h2>
            <p>Hits: {player1.hits}</p>
            <p>Misses: {player1.misses}</p>
            <p>Remaining Ships: {player1.remainingShips}</p>
          </PlayerScore>
          <PlayerScore>
            <h2>Player 2</h2>
            <p>Hits: {player2.hits}</p>
            <p>Misses: {player2.misses}</p>
            <p>Remaining Ships: {player2.remainingShips}</p>
          </PlayerScore>
        </ScoreboardContainer>
        <Message>{message}</Message>
        <Board
          board={board}
          handleCellClick={handleCellClick}
          disabled={isGameOver}
          currentPlayer={currentPlayer}
        />
        <ShipContainer>
          <ShipDrag length={SHIP_LENGTH} />
        </ShipContainer>
        <ResetButton onClick={resetGame}>Reset Game</ResetButton>
      </div>
    </DndProvider>
      </div>
    </DndProvider>
  );
}

export default Game;
