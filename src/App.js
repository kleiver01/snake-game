import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameBoard from './components/GameBoard';
import GameButton from './components/GameButton';
import GameScore from './components/GameScore';

const GRID_SIZE = 20;
const CELL_SIZE = 20;

const DIFFICULTY_LEVELS = {
  easy: { speed: 250, name: 'Fácil' },
  medium: { speed: 150, name: 'Normal' },
  hard: { speed: 80, name: 'Difícil' },
};

const FOOD_TYPES = {
  apple: { color: 'bg-red-500', score: 1, effect: 'none', name: 'Manzana', sound: process.env.PUBLIC_URL + '/sounds/button-1.mp3' },
  berry: { color: 'bg-blue-500', score: 2, effect: 'speed_up', name: 'Baya', sound: process.env.PUBLIC_URL + '/sounds/button-2.mp3' },
  mushroom: { color: 'bg-purple-500', score: 1, effect: 'slow_down', name: 'Hongo', sound: process.env.PUBLIC_URL + '/sounds/button-3.mp3' },
};

const App = () => {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5, type: 'apple' });
  const [direction, setDirection] = useState('right');
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(DIFFICULTY_LEVELS.medium.speed);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [theme, setTheme] = useState('light');
  const [isMuted, setIsMuted] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [cellSize, setCellSize] = useState(CELL_SIZE);

  const gameAreaRef = useRef(null);
  const lastDirection = useRef(direction);
  const prevGameOver = useRef(false);

  const generateFood = useCallback(() => {
    let newFoodPos;
    let collision;
    do {
      newFoodPos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      collision = snake.some(segment => segment.x === newFoodPos.x && segment.y === newFoodPos.y);
    } while (collision);

    const foodTypesKeys = Object.keys(FOOD_TYPES);
    const randomFoodType = foodTypesKeys[Math.floor(Math.random() * foodTypesKeys.length)];

    setFood({ ...newFoodPos, type: randomFoodType });
  }, [snake]);

  const playSound = useCallback((soundUrl) => {
    if (isMuted) return;
    const audio = new Audio(soundUrl);
    audio.volume = 0.2; // Ajustar volumen
    audio.play().catch(e => console.error("Error playing sound:", e)); // Manejar errores de reproducción
  }, [isMuted]);

  const startGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection('right');
    lastDirection.current = 'right';
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    setCurrentSpeed(DIFFICULTY_LEVELS[difficulty].speed);
    setTime(0);
    setIsRunning(true);
    setIsPaused(false);
    generateFood();
    if (gameAreaRef.current) {
      gameAreaRef.current.focus();
    }
  };

  const togglePause = () => {
    setIsPaused(prevPaused => !prevPaused);
    setIsRunning(prevRunning => !prevRunning);
  };

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const toggleMute = () => {
    setIsMuted(prevMuted => !prevMuted);
  };

  const handleDifficultyChange = (e) => {
    setDifficulty(e.target.value);
  };

  const handleKeyDown = useCallback((e) => {
    if (isPaused || gameOver) return;

    const newDirKey = e.key.replace('Arrow', '').toLowerCase();
    let newDir = '';

    if (newDirKey === 'up' || newDirKey === 'w') newDir = 'up';
    else if (newDirKey === 'down' || newDirKey === 's') newDir = 'down';
    else if (newDirKey === 'left' || newDirKey === 'a') newDir = 'left';
    else if (newDirKey === 'right' || newDirKey === 'd') newDir = 'right';

    const currentDir = lastDirection.current;

    if (
      (newDir === 'up' && currentDir !== 'down') ||
      (newDir === 'down' && currentDir !== 'up') ||
      (newDir === 'left' && currentDir !== 'right') ||
      (newDir === 'right' && currentDir !== 'left')
    ) {
      setDirection(newDir);
    }
  }, [isPaused, gameOver]);

  // Manejo de swipes para móvil
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const handleTouchStart = (e) => {
    e.preventDefault(); // <-- Agrega esto
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    e.preventDefault(); // <-- Agrega esto
    if (isPaused || gameOver) return;
    if (!touchStartX.current || !touchStartY.current) return;

    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;

    const dx = touchEndX - touchStartX.current;
    const dy = touchEndY - touchStartY.current;

    const currentDir = lastDirection.current;
    let newDir = '';

    if (Math.abs(dx) > Math.abs(dy)) { // Movimiento horizontal
      if (dx > 0 && currentDir !== 'left') newDir = 'right';
      else if (dx < 0 && currentDir !== 'right') newDir = 'left';
    } else { // Movimiento vertical
      if (dy > 0 && currentDir !== 'up') newDir = 'down';
      else if (dy < 0 && currentDir !== 'down') newDir = 'up';
    }

    if (newDir) {
      setDirection(newDir);
    }

    touchStartX.current = 0;
    touchStartY.current = 0;
  };


  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
  if (gameOver || isPaused) {
    setIsRunning(false);
    // Ya NO hay ninguna llamada a playSound aquí
    return;
  }

  const moveSnake = () => {
    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };

      lastDirection.current = direction;

      switch (direction) {
        case 'up':
          head.y--;
          break;
        case 'down':
          head.y++;
          break;
        case 'left':
          head.x--;
          break;
        case 'right':
          head.x++;
          break;
        default:
          break;
      }

      // Check for wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true);
        return prevSnake;
      }

      // Check for self-collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        return prevSnake;
      }

      newSnake.unshift(head);

      // Check for food collision
      if (head.x === food.x && head.y === food.y) {
        const foodInfo = FOOD_TYPES[food.type];
        setScore(prevScore => prevScore + foodInfo.score);

        if (foodInfo.effect === 'speed_up') {
          setCurrentSpeed(prevSpeed => Math.max(50, prevSpeed * 0.8));
        } else if (foodInfo.effect === 'slow_down') {
          setCurrentSpeed(prevSpeed => Math.min(DIFFICULTY_LEVELS.easy.speed, prevSpeed * 1.2));
        }

        generateFood();
        playSound(foodInfo.sound);
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  };

  const gameInterval = setInterval(moveSnake, currentSpeed);

  return () => clearInterval(gameInterval);
}, [gameOver, isPaused, direction, food, currentSpeed, generateFood, playSound, score]);

// Sonido de game over (solo local)
useEffect(() => {
  if (gameOver && !isMuted) {
    playSound(process.env.PUBLIC_URL + '/sounds/fail-buzzer-01.mp3');
  }
}, [gameOver, isMuted, playSound]);

  // Temporizador
  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderBoard = () => {
    const board = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
    snake.forEach((segment, index) => {
      if (index === 0) {
        board[segment.y][segment.x] = 'snake-head';
      } else {
        board[segment.y][segment.x] = 'snake';
      }
    });
    board[food.y][food.x] = food.type;
    return board;
  };

  const themeClasses = {
    light: {
      bg: 'bg-gradient-to-br from-gray-100 to-gray-200',
      cardBg: 'bg-white',
      textColor: 'text-gray-900',
      scoreBg: 'bg-white',
      scoreText: 'text-gray-800',
      scoreValue: 'text-black',
      boardBorder: 'border-gray-300',
      boardBg: 'bg-gray-50',
      buttonBg: 'bg-black',
      buttonText: 'text-white',
      buttonHover: 'hover:bg-gray-800',
      pauseBg: 'bg-black bg-opacity-50',
      pauseText: 'text-white',
      snakeColor: 'bg-green-500',
      selectBg: 'bg-white',
      selectBorder: 'border-gray-300',
      selectText: 'text-gray-800',
    },
    dark: {
      bg: 'bg-gradient-to-br from-gray-900 to-black',
      cardBg: 'bg-gray-800',
      textColor: 'text-white',
      scoreBg: 'bg-gray-700',
      scoreText: 'text-gray-300',
      scoreValue: 'text-white',
      boardBorder: 'border-gray-700',
      boardBg: 'bg-gray-900',
      buttonBg: 'bg-white',
      buttonText: 'text-gray-900',
      buttonHover: 'hover:bg-gray-200',
      pauseBg: 'bg-white bg-opacity-20',
      pauseText: 'text-gray-900',
      snakeColor: 'bg-green-400',
      selectBg: 'bg-gray-700',
      selectBorder: 'border-gray-600',
      selectText: 'text-white',
    },
  };

  const currentTheme = themeClasses[theme];

  useEffect(() => {
    if (!prevGameOver.current && gameOver && !isMuted) {
      playSound(process.env.PUBLIC_URL + '/sounds/fail-buzzer-01.mp3');
    }
    prevGameOver.current = gameOver;
  }, [gameOver, isMuted, playSound]);

  useEffect(() => {
    const updateCellSize = () => {
      const container = gameAreaRef.current?.parentElement;
      let maxBoardPx = 440;
      if (container) {
        // Border: 16px (8px a cada lado), Padding: 0 en móvil, 32px a cada lado en sm
        const style = window.getComputedStyle(container);
        const paddingLeft = parseInt(style.paddingLeft) || 0;
        const paddingRight = parseInt(style.paddingRight) || 0;
        const borderLeft = parseInt(style.borderLeftWidth) || 0;
        const borderRight = parseInt(style.borderRightWidth) || 0;
        maxBoardPx = container.offsetWidth - paddingLeft - paddingRight - borderLeft - borderRight;
      } else {
        maxBoardPx = Math.min(window.innerWidth, 440) - 32; // fallback
      }
      const newCellSize = Math.floor(maxBoardPx / GRID_SIZE);
      setCellSize(Math.max(12, Math.min(newCellSize, 32)));
    };
    updateCellSize();
    window.addEventListener('resize', updateCellSize);
    return () => window.removeEventListener('resize', updateCellSize);
  }, []);

  return (
    <div className={`min-h-screen flex items-center justify-center py-4 sm:p-8 ${currentTheme.bg} transition-colors duration-300`}>
      <div
  className={`pt-4 pb-8 sm:p-8 rounded-3xl shadow-2xl border-8 border-gray-700 flex flex-col items-center bg-gray-200`}
  style={{
    maxWidth: 440,
    width: '100%',
    boxSizing: 'border-box',
    background: '#e5e7eb',
  }}
>
        <div className="w-full flex justify-between items-center mb-4">
          <button
            onClick={toggleTheme}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${theme === 'light' ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
          >
            {theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
          </button>
          <button
            onClick={toggleMute}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${theme === 'light' ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
          >
            {/* Si está muteado, muestra el ícono mute */}
            {!isMuted ? (
              // Icono de sonido activado
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" />
              </svg>
            ) : (
              // Icono de sonido muteado
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 6.343a1 1 0 010 1.414L13.243 9.172a3 3 0 000 4.243l1.414 1.414a1 1 0 01-1.414 1.414l-1.414-1.414a5 5 0 010-7.07l1.414-1.414a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
        <h1 className={`text-4xl font-extrabold mb-8 tracking-tight ${currentTheme.textColor}`}>
          Snake <span className="text-green-500">Clásico</span>
        </h1>
        <div className="flex justify-between w-full mb-6">
          <GameScore score={score} scoreBg={currentTheme.scoreBg} scoreText={currentTheme.scoreText} scoreValue={currentTheme.scoreValue} />
          <div className={`text-center text-2xl font-semibold p-4 rounded-xl shadow-md ${currentTheme.scoreBg} ${currentTheme.scoreText}`}>
            Tiempo: <span className={`font-bold ${currentTheme.scoreValue}`}>{formatTime(time)}</span>
          </div>
        </div>

        <div className="w-full mb-6">
          <label htmlFor="difficulty-select" className={`block text-lg font-medium mb-2 ${currentTheme.textColor}`}>
            Dificultad:
          </label>
          <select
            id="difficulty-select"
            value={difficulty}
            onChange={handleDifficultyChange}
            className={`w-full p-3 rounded-lg border ${currentTheme.selectBorder} ${currentTheme.selectBg} ${currentTheme.selectText} focus:outline-none focus:ring-2 focus:ring-black transition`}
            disabled={!gameOver && isRunning}
          >
            {Object.entries(DIFFICULTY_LEVELS).map(([key, value]) => (
              <option key={key} value={key}>
                {value.name}
              </option>
            ))}
          </select>
        </div>

        <div
          ref={gameAreaRef}
          tabIndex="0"
          className="relative focus:outline-none overflow-hidden touch-none mx-auto"
          style={{
            touchAction: 'none',
            background: '#222',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            width: cellSize * GRID_SIZE,
            height: cellSize * GRID_SIZE,
            border: currentTheme.boardBorder,
            overflow: 'hidden',
            boxSizing: 'content-box',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          <GameBoard
            board={renderBoard()}
            gridSize={GRID_SIZE}
            cellSize={cellSize}
            boardBorder={currentTheme.boardBorder}
            boardBg={currentTheme.boardBg}
            snakeColor={currentTheme.snakeColor}
            foodColors={FOOD_TYPES}
          />
        </div>
        {gameOver ? (
          <div className="mt-8 text-center">
            {gameStarted && <p className={`text-xl font-medium mb-4 ${currentTheme.textColor}`}>¡Juego Terminado!</p>}
            <GameButton onClick={startGame} text={gameStarted ? "Volver a Jugar" : "Empezar Juego"}
              buttonBg={currentTheme.buttonBg} buttonText={currentTheme.buttonText} buttonHover={currentTheme.buttonHover}
            />
          </div>
        ) : (
          <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full">
            <GameButton onClick={startGame} text="Reiniciar Juego"
              buttonBg={currentTheme.buttonBg} buttonText={currentTheme.buttonText} buttonHover={currentTheme.buttonHover}
            />
            <GameButton onClick={togglePause} text={isPaused ? "Reanudar" : "Pausar"}
              buttonBg={currentTheme.buttonBg} buttonText={currentTheme.buttonText} buttonHover={currentTheme.buttonHover}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;