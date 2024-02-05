// ShipDrag.js
import React from 'react';
import { useDrag } from 'react-dnd';

const ShipDrag = ({ length }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'SHIP',
    item: { length },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        backgroundColor: '#8b0000',
        color: '#fff',
        width: `${length * 40}px`, // Assuming cell size is 40px
        height: '40px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '5px',
      }}
    >
      Ship {length}
    </div>
  );
};

export default ShipDrag;
