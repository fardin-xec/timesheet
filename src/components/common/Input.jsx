import React from 'react';

const Input = ({ 
  type = 'text', 
  name, 
  label, 
  value, 
  onChange, 
  required = false, 
  error = '', 
  placeholder = '',
  disabled,
  style = {},
}) => {
  return (
    <div className="input-group">
      {label && <label htmlFor={name}>{label}</label>}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={error ? 'input-error' : ''}
        disabled={disabled}
        style={style}
      />
      {error && <div className="error-text">{error}</div>}
    </div>
  );
};

export default Input;