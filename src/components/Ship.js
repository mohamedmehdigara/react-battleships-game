// Ship.js
import React from 'react';
import { useDrag } from 'react-dnd';
import { ItemTypes } from './ItemTypes'; // Import item types

const Ship = () => {
  const [{ isDragging }, drag] = useDrag({
    item: { type: ItemTypes.SHIP }, // Specify the item type
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
        backgroundImage: 'url("path/to/wooden-ship-image.png")',
        backgroundSize: 'cover',
      }}
    />
  );
};

export default Ship;
