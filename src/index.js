// index.js or App.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App'; // Your main application component
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

ReactDOM.render(
  <DndProvider backend={HTML5Backend}>
    <App />
  </DndProvider>,
  document.getElementById('root')
);
