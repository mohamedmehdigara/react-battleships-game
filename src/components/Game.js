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
import SettingsPanel from './SettingsPanel';
import GameOverModal from './GameOverModal';



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
  const [currentPlayerStats, setCurrentPlayerStats] = useState({
    hits: 0,
    misses: 0,
    remainingShips: NUM_SHIPS,
  });
  const [winner, setWinner] = useState('');
  const [history, setHistory] = useState([]);
  const [turnTime, setTurnTime] = useState(TURN_DURATION);

  const [isTimerRunning, setIsTimerRunning] = useState(false);



  

  useEffect(() => {
    const newBoard = [...board];
    setBoard(newBoard);
  }, []);

  const handleCellClick = (rowIndex, colIndex) => {
    if (isGameOver || board[rowIndex][colIndex].isHit) return;

    const cell = board[rowIndex][colIndex];
    const newBoard = [...board];
    const currentPlayerStats = currentPlayer === 1 ? player1 : player2;

    let newMessage = '';

    if (cell.isShip) {
      // It's a hit!
      newBoard[rowIndex][colIndex].isHit = true;
      newMessage = 'Hit!';

      // Update player stats
      if (currentPlayer === 1) {
        setPlayer1((prevState) => ({
          ...prevState,
          hits: prevState.hits + 1,
        }));
      } else {
        setPlayer2((prevState) => ({
          ...prevState,
          hits: prevState.hits + 1,
        }));
      }
    } else {
      // It's a miss
      newBoard[rowIndex][colIndex].isHit = true;
      newMessage = 'Miss!';

      // Update player stats
      if (currentPlayer === 1) {
        setPlayer1((prevState) => ({
          ...prevState,
          misses: prevState.misses + 1,
        }));
      } else {
        setPlayer2((prevState) => ({
          ...prevState,
          misses: prevState.misses + 1,
        }));
      }
    }

    // Add the move to the history log
    setHistory((prevHistory) => [
      ...prevHistory,
      {
        player: currentPlayer,
        rowIndex,
        colIndex,
        result: cell.isShip ? 'hit' : 'miss',
      },
    ]);

    // Check for game over conditions...
    // Update message, winner, etc.

    // Switch turns
    setCurrentPlayer((prevPlayer) => (prevPlayer === 1 ? 2 : 1));
    setMessage(newMessage);
  };
  

  const resetGame = () => {
    // Reset the game state
    setBoard(generateEmptyBoard());
    setIsGameOver(false);
    setWinner('');
    setMessage('');
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
    setCurrentPlayer(1);
    setHistory([]);
    setTurnTime(TURN_DURATION);
    setIsTimerRunning(false);
  };
 
    // Optionally, you can add a delay before starting the new game
    setTimeout(() => {
      setMessage('New game started. Your turn!');
    }, 1000);
  };

  const getComputerMove = () => {
    // Generate random row and column indices
    const rowIndex = Math.floor(Math.random() * BOARD_SIZE);
    const colIndex = Math.floor(Math.random() * BOARD_SIZE);
  
    // Ensure the generated move hasn't been played before
    const isMoveValid = !board[rowIndex][colIndex].isHit;
  
    // If the move is not valid, generate a new one
    if (!isMoveValid) {
      return getComputerMove();
    }
  
    // Return the valid move
    return { rowIndex, colIndex };
  };
  

  
  const placeShipsRandomly = (board) => {
    const shipLength = SHIP_LENGTH;
  
    // Function to check if a ship can be placed at a specific position
    const canPlaceShip = (row, col, direction) => {
      for (let i = 0; i < shipLength; i++) {
        if (direction === 'horizontal') {
          if (col + i >= BOARD_SIZE || board[row][col + i].isShip) {
            return false; // Ship would go out of bounds or overlap with another ship
          }
        } else {
          if (row + i >= BOARD_SIZE || board[row + i][col].isShip) {
            return false; // Ship would go out of bounds or overlap with another ship
          }
        }
      }
      return true;
    };
  
    // Function to place a ship at a specific position
    const placeShip = (row, col, direction) => {
      for (let i = 0; i < shipLength; i++) {
        if (direction === 'horizontal') {
          board[row][col + i].isShip = true;
        } else {
          board[row + i][col].isShip = true;
        }
      }
    };
  
    // Place ships randomly on the board
    for (let shipNumber = 1; shipNumber <= NUM_SHIPS; shipNumber++) {
      let placed = false;
  
      while (!placed) {
        const row = Math.floor(Math.random() * BOARD_SIZE);
        const col = Math.floor(Math.random() * BOARD_SIZE);
        const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';
  
        if (canPlaceShip(row, col, direction)) {
          placeShip(row, col, direction);
          placed = true;
        }
      }
    }
  };

  const handleApplySettings = (settings) => {
    // Handle the application of new settings here
    // For simplicity, you can just log them for now
    console.log('Applied settings:', settings);
  };
  
  const handleGameOver = (winner) => {
    setIsGameOver(true);
    setWinner(winner);
  };

  const handleNewGame = () => {
    // Reset game state here
    setIsGameOver(false);
    setWinner('');
    setBoard(generateEmptyBoard());
    // Reset other game-related state as needed
  };

  useEffect(() => {
    if (isTimerRunning && turnTime > 0) {
      const timer = setInterval(() => {
        setTurnTime((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (turnTime === 0) {
      handleTurnTimeout();
    }
  }, [isTimerRunning, turnTime]);

  const startTurnTimer = () => {
    setIsTimerRunning(true);
  };

  const handleCellClick = (rowIndex, colIndex) => {
    // Reset turn timer when a cell is clicked
    setTurnTime(TURN_DURATION);

    // Your existing cell click logic...
  };

  const handleTurnTimeout = () => {
    // Handle turn timeout
    setIsTimerRunning(false);
    setMessage('Time\'s up! Next player\'s turn.');
    setCurrentPlayer((prevPlayer) => (prevPlayer === 1 ? 2 : 1));
  };


  
  return (
      <DndProvider backend={HTML5Backend}>
      <div>
        <h1>Battleships Game</h1>
        <div>
          <h2>Turn Timer: {turnTime}</h2>
        </div>
      
        <SettingsPanel onApplySettings={handleApplySettings} />
        {isGameOver && (
          <GameOverModal winner={winner} onNewGame={handleNewGame} />
        )}

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
    
  );
}

export default Game;
