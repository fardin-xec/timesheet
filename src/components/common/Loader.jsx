import React from 'react';

const Loader = ({ size = 'medium' }) => {
  const sizeClass = {
    small: 'loader-sm',
    medium: 'loader-md',
    large: 'loader-lg'
  }[size] || 'loader-md';

  return (
    <div className={`loader ${sizeClass}`}>
      <div className="loader-spinner"></div>
    </div>
  );
};

export default Loader;