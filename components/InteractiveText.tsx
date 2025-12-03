import React from 'react';

interface InteractiveTextProps {
  text: string;
  className?: string;
}

export const InteractiveText: React.FC<InteractiveTextProps> = ({ text, className = '' }) => {
  return (
    <span className={className}>
      {text}
    </span>
  );
};