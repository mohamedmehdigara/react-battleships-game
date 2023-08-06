import React from 'react';
import Cell from './Cell';

function Board({ board, handleCellClick }) {
  return (
    <div className="board">
      {board && board.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((cell, colIndex) => (
            <Cell
              key={colIndex}
              isShip={cell.isShip}
              isHit={cell.isHit}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Board;
