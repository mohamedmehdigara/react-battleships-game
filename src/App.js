import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Stars, Sky, Environment, Float } from '@react-three/drei';
import { create } from 'zustand';
import styled, { createGlobalStyle } from 'styled-components';

// --- Game Logic Store ---
const GRID_SIZE = 10;
const CELL_SIZE = 1.8;
const OFFSET = (GRID_SIZE * CELL_SIZE) / 2;

const useGameStore = create((set, get) => ({
  playerBoard: Array(100).fill(null).map(() => ({ hasShip: false, hit: false, miss: false })),
  enemyBoard: Array(100).fill(null).map(() => ({ hasShip: false, hit: false, miss: false })),
  isPlayerTurn: true,
  gameOver: false,
  status: "FLEET COMMANDER ONLINE",

  initGame: () => {
    const generateFleet = () => {
      let grid = Array(100).fill(null).map(() => ({ hasShip: false, hit: false, miss: false }));
      const shipSizes = [5, 4, 3, 3, 2];
      
      shipSizes.forEach(size => {
        let placed = false;
        while (!placed) {
          const isHorizontal = Math.random() > 0.5;
          const x = Math.floor(Math.random() * (isHorizontal ? 10 - size : 10));
          const y = Math.floor(Math.random() * (isHorizontal ? 10 : 10 - size));
          
          const indices = [];
          for (let i = 0; i < size; i++) {
            indices.push(isHorizontal ? (y * 10 + (x + i)) : ((y + i) * 10 + x));
          }

          if (indices.every(idx => !grid[idx].hasShip)) {
            indices.forEach(idx => { grid[idx].hasShip = true; });
            placed = true;
          }
        }
      });
      return grid;
    };

    set({ 
      playerBoard: generateFleet(), 
      enemyBoard: generateFleet(), 
      gameOver: false, 
      isPlayerTurn: true,
      status: "ALL SYSTEMS GO" 
    });
  },

  fire: (idx) => {
    const { enemyBoard, isPlayerTurn, gameOver } = get();
    if (!isPlayerTurn || gameOver || enemyBoard[idx].hit || enemyBoard[idx].miss) return;

    const newBoard = [...enemyBoard];
    const isHit = newBoard[idx].hasShip;
    newBoard[idx] = { ...newBoard[idx], hit: isHit, miss: !isHit };
    
    set({ enemyBoard: newBoard, isPlayerTurn: false, status: isHit ? "DIRECT HIT!" : "MISS" });
    get().checkWin(newBoard, "Player");
    if (!get().gameOver) setTimeout(() => get().aiMove(), 1000);
  },

  aiMove: () => {
    const { playerBoard, gameOver } = get();
    if (gameOver) return;
    const targets = playerBoard.map((c, i) => (!c.hit && !c.miss ? i : null)).filter(v => v !== null);
    const target = targets[Math.floor(Math.random() * targets.length)];
    const newBoard = [...playerBoard];
    newBoard[target] = { ...newBoard[target], hit: newBoard[target].hasShip, miss: !newBoard[target].hasShip };
    set({ playerBoard: newBoard, isPlayerTurn: true, status: "INCOMING RADAR CONTACT" });
    get().checkWin(newBoard, "Enemy");
  },

  checkWin: (board, user) => {
    if (board.filter(c => c.hasShip && !c.hit).length === 0) {
      set({ gameOver: true, status: user === "Player" ? "VICTORY" : "FLEET LOST" });
    }
  }
}));

// --- 3D Naval Assets ---

const ShipMesh = ({ color }) => (
  <group position={[0, 0.4, 0]}>
    {/* Hull */}
    <mesh castShadow>
      <boxGeometry args={[1.4, 0.5, 0.7]} />
      <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
    </mesh>
    {/* Cabin */}
    <mesh position={[0, 0.45, 0]} castShadow>
      <boxGeometry args={[0.5, 0.4, 0.4]} />
      <meshStandardMaterial color="#546e7a" />
    </mesh>
    {/* Mast */}
    <mesh position={[0, 0.8, 0]}>
      <cylinderGeometry args={[0.04, 0.04, 0.6]} />
      <meshStandardMaterial color="#263238" />
    </mesh>
  </group>
);

const Ocean = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
    <planeGeometry args={[100, 100]} />
    <meshStandardMaterial color="#003d5b" metalness={0.9} roughness={0.1} transparent opacity={0.8} />
  </mesh>
);

const Board3D = ({ board, isEnemy, onAttack }) => {
  return (
    <group position={isEnemy ? [12, 0, 0] : [-12, 0, 0]}>
      {/* Wooden Board Base */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[19, 0.4, 19]} />
        <meshStandardMaterial color="#3e2723" roughness={0.8} />
      </mesh>

      <Text position={[0, 5, -10]} fontSize={1.5} color={isEnemy ? "#ff1744" : "#00e5ff"}>
        {isEnemy ? "RADAR (ENEMY)" : "FLEET (PLAYER)"}
      </Text>
      
      {board.map((cell, i) => {
        const x = (i % 10) * CELL_SIZE - OFFSET + (CELL_SIZE / 2);
        const z = Math.floor(i / 10) * CELL_SIZE - OFFSET + (CELL_SIZE / 2);
        
        return (
          <group key={i} position={[x, 0, z]}>
            {/* Cell Slot */}
            <mesh onClick={() => isEnemy && onAttack(i)}>
              <boxGeometry args={[1.5, 0.1, 1.5]} />
              <meshStandardMaterial color={isEnemy ? "#1a237e" : "#0d47a1"} />
            </mesh>

            {/* Ship Presence */}
            {((!isEnemy && cell.hasShip) || (isEnemy && cell.hasShip && cell.hit)) && (
              <ShipMesh color={isEnemy ? "#cfd8dc" : "#90a4ae"} />
            )}

            {/* Peg Markers (Red for Hit, White for Miss) */}
            {cell.hit && (
              <mesh position={[0, 1, 0]}>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshStandardMaterial color="#ff1744" emissive="#ff1744" emissiveIntensity={0.5} />
              </mesh>
            )}
            {cell.miss && (
              <mesh position={[0, 0.5, 0]}>
                <sphereGeometry args={[0.2, 8, 8]} />
                <meshStandardMaterial color="#ffffff" />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
};

// --- Main UI Overlay ---
const GlobalStyle = createGlobalStyle`
  body { margin: 0; background: #000c14; overflow: hidden; font-family: 'Courier New', monospace; }
`;

const HUD = styled.div`
  position: absolute; top: 40px; width: 100%; text-align: center; z-index: 10; pointer-events: none;
`;

const Status = styled.div`
  background: rgba(0, 0, 0, 0.8); display: inline-block; padding: 15px 50px;
  border-top: 4px solid #00e5ff; color: #00e5ff; font-size: 1.8rem; font-weight: bold;
`;

export default function App() {
  const { playerBoard, enemyBoard, status, initGame, fire } = useGameStore();

  useEffect(() => { initGame(); }, []);

  return (
    <>
      <GlobalStyle />
      <HUD><Status>{status}</Status></HUD>

      <Canvas shadows camera={{ position: [0, 35, 40], fov: 35 }}>
        <Sky sunPosition={[100, 20, 100]} />
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade />
        
        <ambientLight intensity={1.2} /> 
        <directionalLight position={[20, 40, 20]} intensity={2.5} castShadow />

        <Suspense fallback={null}>
          <Ocean />
          <Board3D board={playerBoard} isEnemy={false} />
          <Board3D board={enemyBoard} isEnemy={true} onAttack={fire} />
          <Environment preset="city" />
        </Suspense>

        <OrbitControls maxPolarAngle={Math.PI / 2.3} minDistance={20} maxDistance={60} />
      </Canvas>
    </>
  );
}