import React, { useEffect, useState } from 'react';
import './App.css';

type Position = {
  x: number;
  y: number;
};

const generateMaze = (width: number, height: number): boolean[][] => {
  let maze = Array.from({ length: height }, () => Array.from({ length: width }, () => true));

  const carvePath = (x: number, y: number) => {
    const directions = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];

    maze[y][x] = false;
    directions.sort(() => Math.random() - 0.5);

    for (let [dx, dy] of directions) {
      const nx = x + dx * 2,
            ny = y + dy * 2;

      if (ny >= 0 && ny < height && nx >= 0 && nx < width && maze[ny][nx]) {
        maze[y + dy][x + dx] = false;
        carvePath(nx, ny);
      }
    }
  };

  carvePath(1, 1);
  return maze;
};

const generateNewGoalPosition = (maze: boolean[][], playerPosition: Position): Position => {
  let newGoalPosition;
  do {
    newGoalPosition = {
      x: Math.floor(Math.random() * (maze[0].length - 2)) + 1,
      y: Math.floor(Math.random() * (maze.length - 2)) + 1
    };
  } while (maze[newGoalPosition.y][newGoalPosition.x] || (newGoalPosition.x === playerPosition.x && newGoalPosition.y === playerPosition.y));

  return newGoalPosition;
};

const App: React.FC = () => {
  // Initialize dimensions with default values to avoid asking immediately
  const [dimensions, setDimensions] = useState({ width: 10, height: 10 });
  const [maze, setMaze] = useState<boolean[][] | null>(null);
  const [playerPosition, setPlayerPosition] = useState<Position>({ x: 1, y: 1 });
  const [goalPosition, setGoalPosition] = useState<Position>({ x: 1, y: 1 });
  const [score, setScore] = useState<number>(0);
  const [isGameInitialized, setIsGameInitialized] = useState(false);

  // Setup game function to handle initialization and reset
  const setupGame = (width: number, height: number) => {
    setDimensions({ width, height });
    const newMaze = generateMaze(width, height);
    setMaze(newMaze);
    setPlayerPosition({ x: 1, y: 1 });
    setGoalPosition(generateNewGoalPosition(newMaze, { x: 1, y: 1 }));
    setScore(0);
    setIsGameInitialized(true);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!maze) return; // Ensure maze is initialized
      event.preventDefault();
      let { x, y } = playerPosition;
      switch (event.key) {
        case 'ArrowUp': y = Math.max(y - 1, 0); break;
        case 'ArrowDown': y = Math.min(y + 1, dimensions.height - 1); break;
        case 'ArrowLeft': x = Math.max(x - 1, 0); break;
        case 'ArrowRight': x = Math.min(x + 1, dimensions.width - 1); break;
        default: return;
      }

      if (!maze[y][x]) {
        setPlayerPosition({ x, y });

        if (x === goalPosition.x && y === goalPosition.y) {
          setGoalPosition(generateNewGoalPosition(maze, { x, y }));
          setScore((prevScore) => prevScore + 1); // Increment score
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPosition, maze, dimensions, goalPosition]);


  const handleStartResetGame = () => {
    const width = parseInt(window.prompt('Enter maze width:', `${dimensions.width}`) || `${dimensions.width}`, 10);
    const height = parseInt(window.prompt('Enter maze height:', `${dimensions.height}`) || `${dimensions.height}`, 10);
    setupGame(width, height);
  };

  return (
    <div className="App">
      {!isGameInitialized ? (
        <button onClick={handleStartResetGame}>Start Game</button>
      ) : (
        <>
          <div>Score: {score}</div>
          <button onClick={handleStartResetGame}>Restart Game</button>
          {maze && <div className="maze">
            {maze.map((row, y) => (
              <div key={y} className="row">
                {row.map((cell, x) => (
                  <div
                    key={x}
                    className={`cell ${!cell ? 'path' : 'wall'} ${x === playerPosition.x && y === playerPosition.y ? 'player' : ''} ${x === goalPosition.x && y === goalPosition.y ? 'goal' : ''}`}
                  ></div>
                ))}
              </div>
            ))}
          </div>}
        </>
      )}
    </div>
  );
};

export default App;
