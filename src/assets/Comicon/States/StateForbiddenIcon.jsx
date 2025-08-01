import React from 'react';

const StateForbiddenIcon = ({ height = '100%' }) => (
  <svg
    width="800px"
    height="800px"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    style={{ enableBackground: 'new 0 0 100 100' }}
    width={height}
    height={height}
  >
    {/* Gradient definition */}
    <defs>
      <linearGradient 
        id="ForbiddenGradient" 
        x1="20" 
        y1="60" 
        x2="60" 
        y2="40" 
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#650E13" offset="0" />
        <stop stopColor="#DD3043" offset="1" />
      </linearGradient>
    </defs>

    {/* Outer red circle */}
    <circle 
      cx="50" 
      cy="50" 
      r="48" 
      fill="#650E13"
    />

    {/* Inner gradient circle with border */}
    <circle 
      cx="50" 
      cy="50" 
      r="43" 
      fill="url(#ForbiddenGradient)"
      stroke="#eeeeee"
      strokeWidth="3"
    />

    {/* Forbidden slash symbol */}
    <path 
      fill="#ffffff" 
      d="M19 42h61v17H19z"
    />
  </svg>
);

export default StateForbiddenIcon;