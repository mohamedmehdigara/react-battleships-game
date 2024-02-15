import React from 'react';
import { useDrag } from 'react-dnd';
import { ItemTypes } from './ItemTypes';

const Ship = () => {
  const [{ isDragging }, drag] = useDrag({
    item: { type: ItemTypes.SHIP }, // Make sure ItemTypes.SHIP is correctly defined
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        width: '100px',
        height: '50px',
        backgroundSize: 'cover',
      }}
    />
  );
};

export default Ship;
