import React from 'react';

const StateAgreedIcon = ({ height = '100%' }) => (
  <svg
    width="800px"
    height="800px"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    version="1.1"
    style={{ enableBackground: 'new 0 0 100 100' }}
    width={height}
    height={height}
  >
    {/* Gradient definition */}
    <defs>
      <linearGradient 
        id="Gradient" 
        x1="20" 
        y1="60" 
        x2="60" 
        y2="40" 
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#0F650E" stopOpacity="1" offset="0" />
        <stop stopColor="#399238" stopOpacity="1" offset="1" />
      </linearGradient>
    </defs>

    {/* Outer green circle */}
    <circle 
      cx="50" 
      cy="50" 
      r="48" 
      fill="#0F650E"
    />

    {/* Inner gradient circle with border */}
    <circle 
      cx="50" 
      cy="50" 
      r="43" 
      fill="url(#Gradient)"
      stroke="#eeeeee"
      strokeWidth="3"
    />
  </svg>
);

export default StateAgreedIcon;