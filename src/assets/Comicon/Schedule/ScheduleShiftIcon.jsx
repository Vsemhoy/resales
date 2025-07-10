import React from 'react';

const ScheduleShiftIcon = ({ height = '100%' }) => (
  <svg
    version="1.1"
    id="Layer_1"
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    viewBox="0 0 150.72 150.17"
    style={{ enableBackground: 'new 0 0 150.72 150.17' }}
    xmlSpace="preserve"
    width={height}
    height={height}
  >
    {/* Main rectangle with stroke */}
    <rect 
      x="3.58" 
      y="16.44" 
      fill="#E6E7E8" 
      stroke="#231F20" 
      strokeWidth="2" 
      strokeMiterlimit="10" 
      width="143.56" 
      height="130.19"
    />

    {/* Curved paths at the top */}
    <path 
      fill="none" 
      stroke="#231F20" 
      strokeWidth="5" 
      strokeMiterlimit="10" 
      d="M22.91,16.9c0-18.88,15.51-16.73,15.51,0"
    />
    <path 
      fill="none" 
      stroke="#231F20" 
      strokeWidth="5" 
      strokeMiterlimit="10" 
      d="M112.96,16.9c0-18.88,15.51-16.73,15.51,0"
    />

    {/* Colorful grid - alternating blue (#00B4DE) and pink (#EE617B) */}
    <rect x="11.91" y="40.63" fill="#00B4DE" width="20.64" height="20.64"/>
    <rect x="38.58" y="40.63" fill="#EE617B" width="20.64" height="20.64"/>
    <rect x="65.24" y="40.63" fill="#00B4DE" width="20.64" height="20.64"/>
    <rect x="91.91" y="40.63" fill="#EE617B" width="20.64" height="20.64"/>
    
    <rect x="11.91" y="66.09" fill="#EE617B" width="20.64" height="20.64"/>
    <rect x="38.58" y="66.09" fill="#00B4DE" width="20.64" height="20.64"/>
    <rect x="65.24" y="66.09" fill="#EE617B" width="20.64" height="20.64"/>
    <rect x="91.91" y="66.09" fill="#00B4DE" width="20.64" height="20.64"/>
    
    <rect x="11.91" y="91.55" fill="#00B4DE" width="20.64" height="20.64"/>
    <rect x="38.58" y="91.55" fill="#EE617B" width="20.64" height="20.64"/>
    <rect x="65.24" y="91.55" fill="#00B4DE" width="20.64" height="20.64"/>
    <rect x="91.91" y="91.55" fill="#EE617B" width="20.64" height="20.64"/>
    
    <rect x="11.91" y="116.91" fill="#EE617B" width="20.64" height="20.64"/>
    <rect x="38.58" y="116.91" fill="#00B4DE" width="20.64" height="20.64"/>
    <rect x="65.24" y="116.91" fill="#EE617B" width="20.64" height="20.64"/>
    <rect x="91.91" y="116.91" fill="#00B4DE" width="20.64" height="20.64"/>
    
    <rect x="118.09" y="40.63" fill="#00B4DE" width="20.64" height="20.64"/>
    <rect x="118.09" y="66.09" fill="#EE617B" width="20.64" height="20.64"/>
    <rect x="118.09" y="91.55" fill="#00B4DE" width="20.64" height="20.64"/>
    <rect x="118.09" y="116.91" fill="#EE617B" width="20.64" height="20.64"/>

    {/* Gray top bar */}
    <rect x="4.57" y="17.45" fill="#808285" width="141.58" height="16"/>

    {/* White text elements */}
    <g fill="#FFFFFF">
      <path d="M11.56,26.97l1.69-0.16c0.1,0.57,0.31,0.98,0.62,1.25s0.73,0.4,1.26,0.4c0.56,0,0.98-0.12,1.26-0.35s0.42-0.51,0.42-0.83c0-0.2-0.06-0.38-0.18-0.52s-0.33-0.27-0.62-0.37c-0.2-0.07-0.67-0.2-1.39-0.38c-0.93-0.23-1.58-0.51-1.96-0.85c-0.53-0.47-0.79-1.05-0.79-1.73c0-0.44,0.12-0.85,0.37-1.23s0.61-0.67,1.07-0.87s1.03-0.3,1.69-0.3c1.08,0,1.89,0.24,2.43,0.71s0.83,1.1,0.86,1.89l-1.73,0.08c-0.07-0.44-0.23-0.76-0.48-0.95s-0.61-0.29-1.1-0.29c-0.5,0-0.9,0.1-1.18,0.31c-0.18,0.13-0.28,0.31-0.28,0.53c0,0.2,0.09,0.38,0.26,0.52c0.22,0.18,0.75,0.38,1.59,0.57s1.47,0.41,1.87,0.62s0.72,0.5,0.95,0.87s0.34,0.83,0.34,1.37c0,0.49-0.14,0.95-0.41,1.38s-0.66,0.75-1.16,0.96s-1.12,0.31-1.87,0.31c-1.09,0-1.92-0.25-2.5-0.75S11.67,27.93,11.56,26.97z"/>
      <path d="M20.01,29.77v-8.59h1.73v3.38h3.4v-3.38h1.73v8.59h-1.73v-3.76h-3.4v3.76H20.01z"/>
      <path d="M28.62,29.77v-8.59h1.73v8.59H28.62z"/>
      <path d="M32.01,29.77v-8.59h5.89v1.45h-4.15v2.03h3.59v1.45h-3.59v3.65H32.01z"/>
      <path d="M41.27,29.77v-7.14h-2.55v-1.45h6.83v1.45H43v7.14H41.27z"/>
    </g>
  </svg>
);

export default ScheduleShiftIcon;