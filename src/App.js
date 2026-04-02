import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { create } from 'zustand';

// --- Game Logic & State ---
const useGameStore = create((set) => ({
  score: 0,
  health: 100,
  gameOver: false,
  highScore: localStorage.getItem('navalkills') || 0,
  incrementScore: () => set((state) => {
    const newScore = state.score + 10;
    if (newScore > state.highScore) localStorage.setItem('navalkills', newScore);
    return { score: newScore, highScore: Math.max(newScore, state.highScore) };
  }),
  takeDamage: (amt) => set((state) => {
    const newHealth = Math.max(0, state.health - amt);
    return { health: newHealth, gameOver: newHealth <= 0 };
  }),
  resetGame: () => set({ score: 0, health: 100, gameOver: false }),
}));

// --- Animations ---
const waveMove = keyframes`
  0% { background-position: 0 0; }
  100% { background-position: 100px 100px; }
`;

const muzzleFlash = keyframes`
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(2); }
`;

// --- Styled Components ---
const GlobalStyle = createGlobalStyle`
  body { margin: 0; background: #000; color: #fff; font-family: 'Share Tech Mono', monospace; overflow: hidden; }
`;

const Scene = styled.div`
  width: 100vw; height: 100vh; perspective: 1000px;
  background: linear-gradient(to bottom, #02010a 0%, #040c24 100%);
  display: flex; justify-content: center; align-items: center;
`;

const Ocean = styled.div`
  position: absolute; width: 6000px; height: 6000px;
  background-color: #001d3d;
  background-image: 
    linear-gradient(rgba(0, 180, 216, 0.1) 2px, transparent 2px),
    linear-gradient(90deg, rgba(0, 180, 216, 0.1) 2px, transparent 2px);
  background-size: 100px 100px;
  transform: rotateX(70deg) translateZ(-100px);
  transform-style: preserve-3d;
  animation: ${waveMove} 10s linear infinite;
`;

const Entity = styled.div.attrs(props => ({
  style: { transform: `translate3d(${props.x}px, ${props.y}px, ${props.z || 0}px)` },
}))`
  position: absolute; transform-style: preserve-3d;
`;

const Ship = styled.div`
  width: 50px; height: 120px; background: #334155;
  border-radius: 50% 50% 5% 5%;
  box-shadow: 0 20px 30px rgba(0,0,0,0.6);
  &::before { // Deck
    content: ''; position: absolute; top: 30%; left: 10%; width: 80%; height: 40%;
    background: #1e293b; border-radius: 5px; transform: translateZ(15px);
  }
`;

const Enemy = styled(Ship)`
  background: #7f1d1d; border: 1px solid #ef4444;
  &::before { background: #450a0a; }
`;

const Bullet = styled.div`
  width: 8px; height: 25px; background: #fbbf24;
  border-radius: 50%; box-shadow: 0 0 15px #fbbf24;
  transform: translateZ(10px);
`;

const HUD = styled.div`
  position: absolute; top: 30px; left: 30px; z-index: 100;
  pointer-events: none; text-shadow: 0 0 10px #00f2ff;
  .bar { width: 250px; height: 10px; background: #1e293b; border: 1px solid #00f2ff; margin-top: 10px; }
  .fill { height: 100%; background: #00f2ff; transition: width 0.3s; width: ${props => props.health}%; }
`;

const GameOverScreen = styled.div`
  position: absolute; inset: 0; background: rgba(0,0,0,0.9);
  display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 1000;
  h1 { font-size: 4rem; color: #ef4444; }
  button { padding: 15px 40px; background: none; border: 2px solid #00f2ff; color: #00f2ff; cursor: pointer; }
`;

// --- Main App ---
export default function App() {
  const { score, health, gameOver, incrementScore, takeDamage, resetGame, highScore } = useGameStore();
  
  // High-performance state
  const player = useRef({ x: 0, y: 500, vx: 0, vy: 0 });
  const bullets = useRef([]);
  const enemies = useRef([]);
  const keys = useRef({});
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const handleKey = (e) => (keys.current[e.code] = e.type === 'keydown');
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKey);
    };
  }, []);

  const gameLoop = useCallback(() => {
    if (gameOver) return;

    // 1. Momentum Physics
    const p = player.current;
    if (keys.current['ArrowLeft']) p.vx -= 0.8;
    if (keys.current['ArrowRight']) p.vx += 0.8;
    if (keys.current['ArrowUp']) p.vy -= 0.5;
    if (keys.current['ArrowDown']) p.vy += 0.5;

    p.vx *= 0.92; // Friction
    p.vy *= 0.95;
    p.x += p.vx;
    p.y += p.vy;

    // Boundaries
    p.x = Math.max(-400, Math.min(400, p.x));

    // 2. Weapons System
    if (keys.current['Space'] && tick % 12 === 0) {
      bullets.current.push({ x: p.x, y: p.y - 60, id: Math.random() });
    }
    bullets.current.forEach(b => (b.y -= 18));
    bullets.current = bullets.current.filter(b => b.y > -1500);

    // 3. Enemy Fleet AI
    if (Math.random() > 0.96 && enemies.current.length < 8) {
      enemies.current.push({ 
        x: Math.random() * 800 - 400, 
        y: p.y - 1200, 
        speed: 3 + Math.random() * 4,
        id: Math.random() 
      });
    }

    enemies.current.forEach((en, ei) => {
      en.y += en.speed;

      // Bullet Collision
      bullets.current.forEach((b, bi) => {
        if (Math.abs(b.x - en.x) < 35 && Math.abs(b.y - en.y) < 60) {
          enemies.current.splice(ei, 1);
          bullets.current.splice(bi, 1);
          incrementScore();
        }
      });

      // Player Collision
      if (Math.abs(en.x - p.x) < 45 && Math.abs(en.y - p.y) < 70) {
        enemies.current.splice(ei, 1);
        takeDamage(25);
      }
    });

    enemies.current = enemies.current.filter(en => en.y < p.y + 500);

    setTick(t => t + 1);
    requestAnimationFrame(gameLoop);
  }, [gameOver, incrementScore, takeDamage, tick]);

  useEffect(() => {
    const frame = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(frame);
  }, [gameLoop]);

  return (
    <Scene>
      <GlobalStyle />
      <HUD health={health}>
        <h2>OPERATIONAL STATUS: NORM</h2>
        <div className="bar"><div className="fill" /></div>
        <p>CONFIRMED KILLS: {score} | RECORD: {highScore}</p>
      </HUD>

      {gameOver && (
        <GameOverScreen>
          <h1>FLEET DESTROYED</h1>
          <button onClick={() => { resetGame(); window.location.reload(); }}>RE-INITIALIZE SYSTEMS</button>
        </GameOverScreen>
      )}

      {/* The 3D World */}
      <Ocean style={{ transform: `rotateX(70deg) translateY(${-player.current.y}px) translateX(${-player.current.x * 0.1}px)` }}>
        
        {/* Player */}
        <Entity x={player.current.x} y={player.current.y}>
          <Ship />
        </Entity>

        {/* Fleet Bullets */}
        {bullets.current.map(b => (
          <Entity key={b.id} x={b.x} y={b.y} z={15}>
            <Bullet />
          </Entity>
        ))}

        {/* Enemy Raiders */}
        {enemies.current.map(en => (
          <Entity key={en.id} x={en.x} y={en.y}>
            <Enemy />
          </Entity>
        ))}
        
      </Ocean>
    </Scene>
  );
}