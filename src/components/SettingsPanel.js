// SettingsPanel.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';

const SettingsPanel = ({ onApplySettings }) => {
  const [boardSize, setBoardSize] = useState(10);
  const [shipTypes, setShipTypes] = useState(3);
  const [difficulty, setDifficulty] = useState('easy');

  const handleApplySettings = () => {
    // Pass the selected settings to the parent component
    onApplySettings({
      boardSize,
      shipTypes,
      difficulty,
    });
  };

  return (
    <div className="settings-panel">
      <h2>Game Settings</h2>
      <label>
        Board Size:
        <input
          type="number"
          min="5"
          max="20"
          value={boardSize}
          onChange={(e) => setBoardSize(parseInt(e.target.value, 10))}
        />
      </label>
      <label>
        Ship Types:
        <input
          type="number"
          min="1"
          max="5"
          value={shipTypes}
          onChange={(e) => setShipTypes(parseInt(e.target.value, 10))}
        />
      </label>
      <label>
        Difficulty:
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </label>
      <button onClick={handleApplySettings}>Apply Settings</button>
    </div>
  );
};

SettingsPanel.propTypes = {
  onApplySettings: PropTypes.func.isRequired,
};

export default SettingsPanel;
