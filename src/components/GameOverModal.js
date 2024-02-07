// GameOverModal.js
import React from 'react';
import PropTypes from 'prop-types';

const GameOverModal = ({ winner, onNewGame }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Game Over</h2>
        <p>Winner: {winner}</p>
        <button onClick={onNewGame}>Start New Game</button>
      </div>
    </div>
  );
};

GameOverModal.propTypes = {
  winner: PropTypes.string.isRequired,
  onNewGame: PropTypes.func.isRequired,
};

export default GameOverModal;
