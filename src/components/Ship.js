import React from 'react';

function Ship({ length }) {
  return <div className={`ship ship-${length}`}></div>;
}

export default Ship;
