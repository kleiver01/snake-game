import React, { useEffect, useState } from 'react';

const GameBoard = ({ board = [], gridSize = 20, boardBorder = 'border-gray-300', boardBg = 'bg-gray-50', snakeColor = 'bg-green-500', foodColors = {} }) => {
  const [cellSize, setCellSize] = useState(20);

  useEffect(() => {
    const updateCellSize = () => {
      const boardPx = Math.min(window.innerWidth, 440) - 32; // 440 = maxWidth del contenedor, 32 = padding
      const newCellSize = Math.floor(boardPx / gridSize);
      setCellSize(Math.max(12, Math.min(newCellSize, 32)));
    };
    updateCellSize();
    window.addEventListener('resize', updateCellSize);
    return () => window.removeEventListener('resize', updateCellSize);
  }, [gridSize]);

  return (
    <div
      className="relative"
      style={{
        width: '100%',
        height: '100%',
        background: boardBg,
        border: boardBorder,
        borderRadius: 16,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {board.map((row, rowIndex) => (
        row.map((cell, colIndex) => {
          let cellClasses = '';
          let foodSpecificClass = '';

          if (cell === 'snake-head') {
            cellClasses = `${snakeColor} rounded-sm relative`;
            // Ojo de la serpiente xd
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`absolute ${cellClasses}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  left: colIndex * cellSize,
                  top: rowIndex * cellSize,
                }}
              >
                <div className="absolute w-1 h-1 bg-white rounded-full" style={{ top: '30%', left: '25%' }}></div>
                <div className="absolute w-1 h-1 bg-white rounded-full" style={{ top: '30%', left: '65%' }}></div>
              </div>
            );
          } else if (cell === 'snake') {
            cellClasses = `${snakeColor} rounded-sm`;
          } else if (foodColors[cell]) { // Si la celda es un tipo de comida
            foodSpecificClass = `${foodColors[cell].color} rounded-full animate-pulse`;
            cellClasses = foodSpecificClass;
          }

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`absolute ${cellClasses}`}
              style={{
                width: cellSize,
                height: cellSize,
                left: colIndex * cellSize,
                top: rowIndex * cellSize,
              }}
            />
          );
        })
      ))}
    </div>
  );
};

export default GameBoard;