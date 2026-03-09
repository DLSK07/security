import React from 'react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  icon: Icon, 
  className = '', 
  disabled, 
  ...props 
}) => {
  return (
    <button 
      className={`btn btn-${variant} ${className}`} 
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};

export const IconButton = ({ icon: Icon, className = '', ...props }) => {
  return (
    <button className={`btn-icon ${className}`} {...props}>
      <Icon size={18} />
    </button>
  );
};

export const Badge = ({ children, variant = 'neutral' }) => {
  return (
    <span className={`badge badge-${variant}`}>
      {children}
    </span>
  );
};
