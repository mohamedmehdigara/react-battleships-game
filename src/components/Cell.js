import React from 'react';

function Cell({ isShip, isHit, onClick }) {
  let cellClass = 'cell';
  if (isHit) {
    cellClass += ' hit';
  } else if (isShip) {
    cellClass += ' ship';
  }

  return <div className={cellClass} onClick={onClick}></div>;
}

export default Cell;
