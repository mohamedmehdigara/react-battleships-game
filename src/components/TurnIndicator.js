// TurnIndicator.js
import React from 'react';
import PropTypes from 'prop-types';

const TurnIndicator = ({ currentPlayer }) => {
  return (
    <div className="turn-indicator">
      <h2>{`Player ${currentPlayer}'s Turn`}</h2>
    </div>
  );
};

TurnIndicator.propTypes = {
  currentPlayer: PropTypes.number.isRequired,
};

export default TurnIndicator;
