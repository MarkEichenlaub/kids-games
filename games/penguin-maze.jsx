import React, { useState, useEffect, useCallback, useRef } from 'react';

// Maze generation using recursive backtracking
const generateMaze = (width, height) => {
  // Initialize grid with all walls
  const maze = Array(height).fill(null).map(() => 
    Array(width).fill(1)
  );
  
  const directions = [
    [0, -2], // up
    [2, 0],  // right
    [0, 2],  // down
    [-2, 0]  // left
  ];
  
  const shuffle = (arr) => {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };
  
  const carve = (x, y) => {
    maze[y][x] = 0;
    
    const shuffledDirs = shuffle(directions);
    
    for (const [dx, dy] of shuffledDirs) {
      const nx = x + dx;
      const ny = y + dy;
      
      if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && maze[ny][nx] === 1) {
        maze[y + dy / 2][x + dx / 2] = 0;
        carve(nx, ny);
      }
    }
  };
  
  // Start carving from position (1, 1)
  carve(1, 1);
  
  // Set start and end positions
  const start = { x: 1, y: 1 };
  const end = { x: width - 2, y: height - 2 };
  maze[end.y][end.x] = 0;
  
  return { maze, start, end };
};

// Penguin component
const Penguin = ({ x, y, cellSize, direction }) => {
  const centerX = x * cellSize + cellSize / 2;
  const centerY = y * cellSize + cellSize / 2;
  const size = cellSize * 0.8;
  
  return (
    <g transform={`translate(${centerX}, ${centerY})`}>
      {/* Body */}
      <ellipse cx={0} cy={size * 0.1} rx={size * 0.35} ry={size * 0.4} fill="#1a1a2e" />
      {/* Belly */}
      <ellipse cx={0} cy={size * 0.15} rx={size * 0.22} ry={size * 0.3} fill="#f0f0f0" />
      {/* Head */}
      <circle cx={0} cy={-size * 0.25} r={size * 0.25} fill="#1a1a2e" />
      {/* Eyes */}
      <circle cx={-size * 0.08} cy={-size * 0.28} r={size * 0.06} fill="white" />
      <circle cx={size * 0.08} cy={-size * 0.28} r={size * 0.06} fill="white" />
      <circle cx={-size * 0.06 + (direction === 'left' ? -2 : direction === 'right' ? 2 : 0)} 
              cy={-size * 0.27 + (direction === 'up' ? -1 : direction === 'down' ? 1 : 0)} 
              r={size * 0.03} fill="#1a1a2e" />
      <circle cx={size * 0.06 + (direction === 'left' ? -2 : direction === 'right' ? 2 : 0)} 
              cy={-size * 0.27 + (direction === 'up' ? -1 : direction === 'down' ? 1 : 0)} 
              r={size * 0.03} fill="#1a1a2e" />
      {/* Beak */}
      <ellipse cx={0} cy={-size * 0.15} rx={size * 0.08} ry={size * 0.05} fill="#f4a460" />
      {/* Feet */}
      <ellipse cx={-size * 0.12} cy={size * 0.45} rx={size * 0.1} ry={size * 0.05} fill="#f4a460" />
      <ellipse cx={size * 0.12} cy={size * 0.45} rx={size * 0.1} ry={size * 0.05} fill="#f4a460" />
    </g>
  );
};

// Snowflake component
const Snowflake = ({ x, y, size, delay }) => {
  return (
    <g className="snowflake" style={{ 
      animation: `fall ${8 + Math.random() * 4}s linear infinite`,
      animationDelay: `${delay}s`
    }}>
      <text x={x} y={y} fontSize={size} fill="white" opacity={0.6}>❄</text>
    </g>
  );
};

// Goal marker component
const GoalMarker = ({ x, y, cellSize }) => {
  const centerX = x * cellSize + cellSize / 2;
  const centerY = y * cellSize + cellSize / 2;
  
  return (
    <g>
      <circle cx={centerX} cy={centerY} r={cellSize * 0.3} fill="#ffd700" opacity={0.8}>
        <animate attributeName="r" values={`${cellSize * 0.25};${cellSize * 0.35};${cellSize * 0.25}`} dur="1s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;1;0.6" dur="1s" repeatCount="indefinite" />
      </circle>
      <text x={centerX} y={centerY + 5} textAnchor="middle" fontSize={cellSize * 0.5}>🐟</text>
    </g>
  );
};

export default function PenguinMaze() {
  const [difficulty, setDifficulty] = useState(5);
  const [mazeData, setMazeData] = useState(null);
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [direction, setDirection] = useState('down');
  const [won, setWon] = useState(false);
  const [moves, setMoves] = useState(0);
  const [message, setMessage] = useState('');
  const containerRef = useRef(null);
  
  const getMazeSize = (diff) => {
    const size = 7 + diff * 2;
    return size % 2 === 0 ? size + 1 : size;
  };
  
  const initMaze = useCallback((diff) => {
    const size = getMazeSize(diff);
    const { maze, start, end } = generateMaze(size, size);
    setMazeData({ maze, start, end, size });
    setPlayerPos(start);
    setDirection('down');
    setWon(false);
    setMoves(0);
    setMessage('');
  }, []);
  
  useEffect(() => {
    initMaze(difficulty);
  }, []);
  
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, [mazeData]);
  
  const handleKeyDown = useCallback((e) => {
    if (won || !mazeData) return;
    
    const { maze } = mazeData;
    let newX = playerPos.x;
    let newY = playerPos.y;
    let newDir = direction;
    
    switch (e.key) {
      case 'ArrowUp':
        newY -= 1;
        newDir = 'up';
        e.preventDefault();
        break;
      case 'ArrowDown':
        newY += 1;
        newDir = 'down';
        e.preventDefault();
        break;
      case 'ArrowLeft':
        newX -= 1;
        newDir = 'left';
        e.preventDefault();
        break;
      case 'ArrowRight':
        newX += 1;
        newDir = 'right';
        e.preventDefault();
        break;
      default:
        return;
    }
    
    setDirection(newDir);
    
    if (newX >= 0 && newX < maze[0].length && newY >= 0 && newY < maze.length && maze[newY][newX] === 0) {
      setPlayerPos({ x: newX, y: newY });
      setMoves(m => m + 1);
      
      if (newX === mazeData.end.x && newY === mazeData.end.y) {
        setWon(true);
        setMessage('🎉 You caught the fish! 🐟');
      }
    }
  }, [playerPos, mazeData, won, direction]);
  
  const handleNextLevel = () => {
    const newDiff = Math.min(difficulty + 1, 15);
    setDifficulty(newDiff);
    initMaze(newDiff);
  };
  
  const handleGiveUp = () => {
    const newDiff = Math.max(difficulty - 1, 1);
    setDifficulty(newDiff);
    initMaze(newDiff);
    setMessage(difficulty > 1 ? "Here's an easier one!" : "This is the easiest maze!");
  };
  
  if (!mazeData) return <div>Loading...</div>;
  
  const { maze, end, size } = mazeData;
  const cellSize = Math.min(400 / size, 30);
  const svgSize = size * cellSize;
  
  const snowflakes = Array(15).fill(null).map((_, i) => ({
    x: Math.random() * svgSize,
    y: Math.random() * svgSize,
    size: 8 + Math.random() * 8,
    delay: Math.random() * 8
  }));
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4" 
         style={{ background: 'linear-gradient(180deg, #1a1a3e 0%, #2d3a65 50%, #4a6fa5 100%)' }}>
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(${svgSize + 20}px) rotate(360deg); opacity: 0; }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .ice-wall {
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }
      `}</style>
      
      <h1 className="text-3xl font-bold text-white mb-2 tracking-wide" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
        🐧 Penguin Maze 🐧
      </h1>
      
      <div className="flex gap-4 mb-3 text-white text-sm">
        <span className="bg-blue-900 bg-opacity-50 px-3 py-1 rounded-full">Level: {difficulty}</span>
        <span className="bg-blue-900 bg-opacity-50 px-3 py-1 rounded-full">Moves: {moves}</span>
      </div>
      
      {message && (
        <div className="text-xl text-yellow-300 mb-2 font-bold animate-pulse">
          {message}
        </div>
      )}
      
      <div 
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="outline-none rounded-lg overflow-hidden"
        style={{ 
          boxShadow: '0 0 30px rgba(100, 200, 255, 0.4), inset 0 0 60px rgba(255,255,255,0.1)',
          border: '3px solid rgba(255,255,255,0.3)'
        }}
      >
        <svg width={svgSize} height={svgSize} style={{ display: 'block' }}>
          <defs>
            <linearGradient id="iceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a8d5e5" />
              <stop offset="50%" stopColor="#7ec8e3" />
              <stop offset="100%" stopColor="#a8d5e5" />
            </linearGradient>
            <linearGradient id="wallGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4a90b8" />
              <stop offset="30%" stopColor="#5ba3cc" />
              <stop offset="70%" stopColor="#3d7a9e" />
              <stop offset="100%" stopColor="#2d5a78" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Background */}
          <rect width={svgSize} height={svgSize} fill="url(#iceGradient)" />
          
          {/* Ice shimmer effect */}
          {Array(5).fill(null).map((_, i) => (
            <rect 
              key={i}
              x={Math.random() * svgSize}
              y={Math.random() * svgSize}
              width={cellSize * 2}
              height={2}
              fill="white"
              opacity={0.3}
              transform={`rotate(${Math.random() * 30 - 15})`}
              style={{ animation: `shimmer ${2 + Math.random() * 2}s ease-in-out infinite`, animationDelay: `${i * 0.5}s` }}
            />
          ))}
          
          {/* Maze walls */}
          {maze.map((row, y) =>
            row.map((cell, x) => {
              if (cell === 1) {
                return (
                  <g key={`${x}-${y}`} className="ice-wall">
                    <rect
                      x={x * cellSize}
                      y={y * cellSize}
                      width={cellSize}
                      height={cellSize}
                      fill="url(#wallGradient)"
                      stroke="#2d5a78"
                      strokeWidth={0.5}
                    />
                    {/* Ice highlight */}
                    <rect
                      x={x * cellSize + 2}
                      y={y * cellSize + 2}
                      width={cellSize * 0.3}
                      height={cellSize * 0.2}
                      fill="white"
                      opacity={0.3}
                      rx={1}
                    />
                  </g>
                );
              }
              return null;
            })
          )}
          
          {/* Snowflakes */}
          {snowflakes.map((sf, i) => (
            <Snowflake key={i} {...sf} />
          ))}
          
          {/* Goal */}
          <GoalMarker x={end.x} y={end.y} cellSize={cellSize} />
          
          {/* Player */}
          <Penguin x={playerPos.x} y={playerPos.y} cellSize={cellSize} direction={direction} />
        </svg>
      </div>
      
      <div className="flex gap-3 mt-4">
        {won ? (
          <button
            onClick={handleNextLevel}
            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full transition-all transform hover:scale-105"
            style={{ boxShadow: '0 4px 15px rgba(72, 187, 120, 0.4)' }}
          >
            Next Level →
          </button>
        ) : (
          <button
            onClick={handleGiveUp}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full transition-all transform hover:scale-105"
            style={{ boxShadow: '0 4px 15px rgba(237, 137, 54, 0.4)' }}
          >
            Give Up
          </button>
        )}
      </div>
      
      <p className="text-blue-200 text-sm mt-4 opacity-80">
        Use arrow keys to move the penguin to the fish!
      </p>
    </div>
  );
}
