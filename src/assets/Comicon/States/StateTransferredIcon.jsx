import React from 'react';

const StateTransferredIcon = ({ height = '100%' }) => (
  <svg
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 800 800"
    style={{ enableBackground: 'new 0 0 800 800' }}
    width={height}
    height={height}
  >
    {/* Outer circle */}
    <circle 
      cx="400" 
      cy="400" 
      r="384" 
      fill="#717375"
    />
    
    {/* Inner circle with border */}
    <circle 
      cx="400" 
      cy="400" 
      r="344" 
      fill="#717375"
      stroke="#EEEEEE"
      strokeWidth="24"
      strokeMiterlimit="32"
    />
    
    {/* Arrow transfer symbol */}
    <path 
      fill="#FFFFFF" 
      d="M152 336v136h285v98l203-170L437 231v105H152z"
    />
  </svg>
);

export default StateTransferredIcon;