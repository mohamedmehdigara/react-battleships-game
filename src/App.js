import './App.css';
import React from 'react';
import Board from './components/Board';
import Cell from './components/Cell';
import Game from './components/Game';
import Ship from './components/Ship';

function App() {
  return (
    <div className="App">
      <Board/>
      <Cell/>
      <Game/>
      <Ship/>
    </div>
  );
}

export default App;
