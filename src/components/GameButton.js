import React from 'react';

const GameButton = ({ onClick = () => {}, text = 'Jugar', disabled = false, buttonBg = 'bg-black', buttonText = 'text-white', buttonHover = 'hover:bg-gray-800' }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full mt-3 px-6 py-3 rounded-xl shadow-lg transition-all duration-300
        ${buttonBg} ${buttonText} ${buttonHover}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-98'}`}
    >
      {text}
    </button>
  );
};

export default GameButton;