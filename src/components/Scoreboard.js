// Scoreboard.js
import React from 'react';
import PropTypes from 'prop-types';

const Scoreboard = ({ player1, player2 }) => {
  return (
    <div className="scoreboard">
      <div className="player-score">
        <h2>Player 1</h2>
        <p>Hits: {player1.hits}</p>
        <p>Misses: {player1.misses}</p>
        <p>Remaining Ships: {player1.remainingShips}</p>
      </div>
      <div className="player-score">
        <h2>Player 2</h2>
        <p>Hits: {player2.hits}</p>
        <p>Misses: {player2.misses}</p>
        <p>Remaining Ships: {player2.remainingShips}</p>
      </div>
    </div>
  );
};

Scoreboard.propTypes = {
  player1: PropTypes.shape({
    hits: PropTypes.number.isRequired,
    misses: PropTypes.number.isRequired,
    remainingShips: PropTypes.number.isRequired,
  }).isRequired,
  player2: PropTypes.shape({
    hits: PropTypes.number.isRequired,
    misses: PropTypes.number.isRequired,
    remainingShips: PropTypes.number.isRequired,
  }).isRequired,
};

export default Scoreboard;
