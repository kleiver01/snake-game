import React from 'react';

const GameScore = ({ score = 0 }) => {
  return (
    <div className="text-center text-2xl font-semibold text-gray-800 mb-6 p-4 bg-white rounded-xl shadow-md">
      Puntuación: <span className="text-black font-bold">{score}</span>
    </div>
  );
};

export default GameScore;