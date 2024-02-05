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
    // ... (your existing handleCellClick logic)

    // Switch turns
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
  };

  const resetGame = () => {
    // ... (your existing resetGame logic)
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
