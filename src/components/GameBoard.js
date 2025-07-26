import React from 'react';

const GameBoard = ({ board = [], gridSize = 20, cellSize = 20, boardBorder = 'border-gray-300', boardBg = 'bg-gray-50', snakeColor = 'bg-green-500', foodColors = {} }) => {
  return (
    <div
      className={`relative border-2 rounded-xl overflow-hidden shadow-inner ${boardBorder} ${boardBg}`}
      style={{ width: gridSize * cellSize, height: gridSize * cellSize }}
    >
      {board.map((row, rowIndex) => (
        row.map((cell, colIndex) => {
          let cellClasses = '';
          let foodSpecificClass = '';

          if (cell === 'snake-head') {
            cellClasses = `${snakeColor} rounded-sm relative`;
            // Ojo de la serpiente
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