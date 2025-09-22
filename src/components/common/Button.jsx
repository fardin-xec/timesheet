import React from 'react';

const Button = ({ children, type = 'button', onClick, disabled, className = '' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`button ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
