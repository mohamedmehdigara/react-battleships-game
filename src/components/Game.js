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

// Constants
const BOARD_SIZE = 10;
const SHIP_LENGTH = 3;
const NUM_SHIPS = 2;
const TURN_DURATION = 60; // Turn duration in seconds

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
    setBoard(generateEmptyBoard());
  }, []);

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

  const handleGameOver = (winner) => {
    setIsGameOver(true);
    setWinner(winner);
  };

  const handleNewGame = () => {
    resetGame();
    setTimeout(() => {
      setMessage('New game started. Your turn!');
    }, 1000);
  };

  const getComputerMove = () => {
    const rowIndex = Math.floor(Math.random() * BOARD_SIZE);
    const colIndex = Math.floor(Math.random() * BOARD_SIZE);
    const isMoveValid = !board[rowIndex][colIndex].isHit;

    if (!isMoveValid) {
      return getComputerMove();
    }

    return { rowIndex, colIndex };
  };

  const placeShipsRandomly = () => {
    const shipLength = SHIP_LENGTH;

    const canPlaceShip = (row, col, direction) => {
      for (let i = 0; i < shipLength; i++) {
        if (direction === 'horizontal') {
          if (col + i >= BOARD_SIZE || board[row][col + i].isShip) {
            return false;
          }
        } else {
          if (row + i >= BOARD_SIZE || board[row + i][col].isShip) {
            return false;
          }
        }
      }
      return true;
    };

    const placeShip = (row, col, direction) => {
      for (let i = 0; i < shipLength; i++) {
        if (direction === 'horizontal') {
          board[row][col + i].isShip = true;
        } else {
          board[row + i][col].isShip = true;
        }
      }
    };

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
    console.log('Applied settings:', settings);
  };

  const handleTurnTimeout = () => {
    setIsTimerRunning(false);
    setMessage("Time's up! Next player's turn.");
    setCurrentPlayer((prevPlayer) => (prevPlayer === 1 ? 2 : 1));
  };

  const startTurnTimer = () => {
    setIsTimerRunning(true);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h1>Battleships Game</h1>
        <Ship />
        
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
