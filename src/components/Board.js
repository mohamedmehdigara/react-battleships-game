// Board.js
import React from 'react';
import { useDrop } from 'react-dnd';
import { ItemTypes } from './ItemTypes'; // Import item types

const Board = () => {
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.SHIP, // Specify accepted item type
    drop: () => console.log('Ship dropped'), // Handle drop event
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      style={{
        width: '500px', // Define big square width
        height: '500px', // Define big square height
        border: '1px solid black', // Add border for visualization
        position: 'relative', // Ensure correct positioning of ships
      }}
    >
      {isOver && (
        <div
          style={{
            position: 'absolute', // Ensure correct positioning of feedback
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.5)', // Add transparent background to indicate droppable area
          }}
        />
      )}
    </div>
  );
};

export default Board;
