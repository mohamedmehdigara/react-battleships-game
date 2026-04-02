import React, { useEffect, useRef, useCallback, useLayoutEffect, useState } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { create } from 'zustand';

// --- Global State ---
const useGameStore = create((set) => ({
  score: 0,
  health: 100,
  heat: 0,
  gameOver: false,
  highScore: parseInt(localStorage.getItem('naval_master_record') || '0'),
  incrementScore: (amt = 250) => set((s) => {
    const newScore = s.score + amt;
    if (newScore > s.highScore) localStorage.setItem('naval_master_record', newScore);
    return { score: newScore, highScore: Math.max(newScore, s.highScore) };
  }),
  takeDamage: (amt) => set((s) => {
    const newHealth = Math.max(0, Math.min(100, s.health - amt));
    return { health: newHealth, gameOver: newHealth <= 0 };
  }),
  updateHeat: (val) => set((s) => ({ heat: Math.max(0, Math.min(100, s.heat + val)) })),
  reset: () => window.location.reload(),
}));

// --- Styles & FX ---
const oceanMove = keyframes`from { background-position: 0 0; } to { background-position: 0 1600px; }`;
const float = keyframes`0%, 100% { transform: translateZ(20px); } 50% { transform: translateZ(40px); }`;

const GlobalStyle = createGlobalStyle`
  body { margin: 0; background: #000; color: #00f2ff; font-family: 'Share Tech Mono', monospace; overflow: hidden; }
`;

const MainContainer = styled.div`
  width: 100vw; height: 100vh; perspective: 1800px;
  display: flex; justify-content: center; align-items: center;
  background: radial-gradient(circle at center, #001d3d 0%, #000 100%);
`;

// FIXED: Increased size and ensured translation stays within bounds
const OceanFloor = styled.div`
  position: absolute; width: 40000px; height: 40000px;
  background-color: #000814;
  background-image: 
    linear-gradient(rgba(0, 242, 255, 0.08) 2px, transparent 2px),
    linear-gradient(90deg, rgba(0, 242, 255, 0.08) 2px, transparent 2px);
  background-size: 200px 200px;
  transform: rotateX(78deg) translateZ(-500px);
  transform-style: preserve-3d;
  /* Reduced animation speed for better tracking */
  animation: ${oceanMove} 30s linear infinite;
`;

const Object3D = styled.div.attrs(props => ({
  style: { 
    transform: `translate3d(${props.x}px, ${props.y}px, ${props.z || 0}px) 
                rotateZ(${props.rz || 0}deg) rotateX(${props.rx || 0}deg)`,
  },
}))`
  position: absolute; transform-style: preserve-3d; will-change: transform;
  transition: transform 0.1s cubic-bezier(0.1, 0, 0.2, 1);
`;

const HullModel = styled.div`
  width: 76px; height: 230px; background: #0f172a;
  clip-path: polygon(50% 0%, 100% 15%, 100% 100%, 0% 100%, 0% 15%);
  border-top: 4px solid #38bdf8;
  box-shadow: 0 0 60px rgba(0, 242, 255, 0.2);
  &::before {
    content: ''; position: absolute; top: 45%; left: 20%; width: 60%; height: 20%;
    background: #1e293b; border: 1px solid #00f2ff; transform: translateZ(50px);
  }
`;

const ItemModel = styled.div`
  width: 40px; height: 40px; background: ${p => p.color};
  border: 2px solid #fff; border-radius: 4px;
  box-shadow: 0 0 30px ${p => p.color};
  animation: ${float} 2s ease-in-out infinite;
`;

const UIOverlay = styled.div`
  position: absolute; inset: 0; padding: 50px; z-index: 1000; pointer-events: none;
  .bar-container { width: 320px; margin-bottom: 25px; }
  .label { font-size: 11px; letter-spacing: 4px; opacity: 0.8; margin-bottom: 8px; }
  .bar { width: 100%; height: 4px; background: rgba(0,0,0,0.6); border: 1px solid #1e293b; }
  .fill { height: 100%; transition: width 0.3s ease-out; background: ${p => p.color || '#00f2ff'}; width: ${p => p.val}%; }
`;

export default function App() {
  const { score, health, heat, gameOver, incrementScore, updateHeat, takeDamage, reset, highScore } = useGameStore();
  
  // FIXED: Reset Y to 0 for a cleaner coordinate origin
  const player = useRef({ x: 0, y: 0, vx: 0, vy: 0, rz: 0, rx: 0 });
  const camera = useRef({ x: 0, y: 0 });
  const projectiles = useRef([]);
  const enemies = useRef([]);
  const items = useRef([]);
  const keys = useRef({});
  const lastUpdate = useRef(performance.now());
  const [frameTrigger, setFrameTrigger] = useState(0);

  useEffect(() => {
    const down = (e) => (keys.current[e.code] = true);
    const up = (e) => (keys.current[e.code] = false);
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  const tick = useCallback((ts) => {
    if (gameOver) return;
    const dt = Math.min((ts - lastUpdate.current) / 16.66, 2) || 1;
    lastUpdate.current = ts;

    const p = player.current;
    const c = camera.current;

    // 1. Controls (Arrow keys)
    if (keys.current['ArrowLeft']) { p.vx -= 1.2 * dt; p.rz = Math.max(-25, p.rz - 3 * dt); }
    else if (keys.current['ArrowRight']) { p.vx += 1.2 * dt; p.rz = Math.min(25, p.rz + 3 * dt); }
    else { p.rz *= Math.pow(0.8, dt); }

    if (keys.current['ArrowUp']) { p.vy -= 1.0 * dt; p.rx = -8; }
    else if (keys.current['ArrowDown']) { p.vy += 1.0 * dt; p.rx = 8; }
    else { p.rx *= Math.pow(0.82, dt); }

    // Apply Momentum
    p.vx *= Math.pow(0.86, dt); p.vy *= Math.pow(0.9, dt);
    p.x += p.vx * dt; p.y += p.vy * dt;
    
    // Bounds Control
    p.x = Math.max(-1100, Math.min(1100, p.x));

    // FIXED: Camera now follows Y 1:1 to prevent "Flying off the ocean"
    c.x += (p.x * 0.2 - c.x) * 0.1 * dt;
    c.y = p.y - 600; // Offset camera behind ship

    // 2. Weapons Logic
    updateHeat(-0.6 * dt);
    if (keys.current['Space'] && heat < 98 && ts % 12 < 2) {
      projectiles.current.push({ x: p.x, y: p.y - 180, id: Math.random() });
      updateHeat(16);
    }
    projectiles.current.forEach(b => b.y -= 50 * dt);
    projectiles.current = projectiles.current.filter(b => b.y > p.y - 5000);

    // 3. Spawning (Adjusted distance to keep entities in view)
    if (Math.random() > 0.94 && enemies.current.length < 20) {
      enemies.current.push({ 
        x: Math.random() * 2200 - 1100, 
        y: p.y - 3000, 
        speed: (8 + (score / 2000)) * dt, 
        id: Math.random() 
      });
    }

    if (Math.random() > 0.995 && items.current.length < 3) {
      const types = [{ t: 'repair', c: '#10b981' }, { t: 'coolant', c: '#3b82f6' }];
      const sel = types[Math.floor(Math.random() * types.length)];
      items.current.push({ x: Math.random() * 1800 - 900, y: p.y - 2000, type: sel.t, color: sel.c, id: Math.random() });
    }

    // 4. Collision Processing
    enemies.current.forEach((en, ei) => {
      en.y += en.speed;
      
      // Ship vs Projectile
      projectiles.current.forEach((sh, si) => {
        if (Math.abs(sh.x - en.x) < 80 && Math.abs(sh.y - en.y) < 150) {
          enemies.current.splice(ei, 1);
          projectiles.current.splice(si, 1);
          incrementScore(200);
        }
      });

      // Ship vs Ship
      if (Math.abs(en.x - p.x) < 70 && Math.abs(en.y - p.y) < 180) {
        enemies.current.splice(ei, 1);
        takeDamage(20);
      }
    });

    items.current.forEach((it, ii) => {
      const dist = Math.hypot(p.x - it.x, p.y - it.y);
      if (dist < 100) {
        if (it.type === 'repair') takeDamage(-30);
        if (it.type === 'coolant') updateHeat(-100);
        items.current.splice(ii, 1);
      }
    });

    // Cleanup off-screen entities
    enemies.current = enemies.current.filter(en => en.y < p.y + 1500);
    items.current = items.current.filter(it => it.y < p.y + 1500);
    
    setFrameTrigger(ts);
    requestAnimationFrame(tick);
  }, [gameOver, heat, score, incrementScore, updateHeat, takeDamage]);

  useLayoutEffect(() => {
    const r = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(r);
  }, [tick]);

  return (
    <MainContainer>
      <GlobalStyle />
      <UIOverlay>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div className="bar-container">
              <div className="label">HULL INTEGRITY // {health}%</div>
              <div className="bar"><div className="fill" style={{ width: `${health}%`, background: health < 35 ? '#ef4444' : '#10b981' }} /></div>
            </div>
            <div className="bar-container">
              <div className="label">WEAPON TEMPERATURE</div>
              <div className="bar"><div className="fill" style={{ width: `${heat}%`, background: heat > 85 ? '#f97316' : '#3b82f6' }} /></div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontSize: '4rem', margin: 0 }}>{score}</h1>
            <p style={{ opacity: 0.5 }}>RECORD: {highScore}</p>
          </div>
        </div>
      </UIOverlay>

      {gameOver && (
        <div style={{ position: 'absolute', zIndex: 2000, textAlign: 'center', background: 'rgba(0,0,0,0.9)', padding: '80px', border: '1px solid #ff0055' }}>
          <h1 style={{ fontSize: '4rem', color: '#ff0055', margin: '0 0 20px 0' }}>SUNK</h1>
          <button onClick={reset} style={{ background: '#00f2ff', border: 'none', padding: '15px 50px', cursor: 'pointer', fontWeight: 'bold' }}>RE-DEPLOY</button>
        </div>
      )}

      {/* FIXED: Coordinates normalized to camera movement */}
      <OceanFloor style={{ transform: `rotateX(78deg) translateY(${-camera.current.y}px) translateX(${-camera.current.x}px)` }}>
        <Object3D x={player.current.x} y={player.current.y} rz={player.current.rz} rx={player.current.rx}>
          <HullModel />
          <div style={{ position: 'absolute', bottom: -50, width: '100%', height: '200px', background: 'rgba(255,255,255,0.06)', filter: 'blur(30px)', borderRadius: '50%' }} />
        </Object3D>

        {items.current.map(it => (
          <Object3D key={it.id} x={it.x} y={it.y} z={30}>
            <ItemModel color={it.color} />
          </Object3D>
        ))}

        {projectiles.current.map(b => (
          <Object3D key={b.id} x={b.x} y={b.y} z={80}>
            <div style={{ width: '14px', height: '80px', background: '#fff', borderRadius: '50%', boxShadow: '0 0 30px #00f2ff' }} />
          </Object3D>
        ))}

        {enemies.current.map(en => (
          <Object3D key={en.id} x={en.x} y={en.y}>
            <HullModel style={{ background: '#1a0505', borderTop: '4px solid #ef4444' }} />
          </Object3D>
        ))}
      </OceanFloor>
    </MainContainer>
  );
}