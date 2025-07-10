import React from 'react';

const ScheduleFreeIcon = ({ height = '100%' }) => (
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

    {/* Green rectangles grid */}
    <rect x="11.91" y="40.63" fill="#47BF6A" width="20.64" height="20.64"/>
    <rect x="38.58" y="40.63" fill="#47BF6A" width="20.64" height="20.64"/>
    <rect x="65.24" y="40.63" fill="#47BF6A" width="20.64" height="20.64"/>
    <rect x="91.91" y="40.63" fill="#47BF6A" width="20.64" height="20.64"/>
    <rect x="11.91" y="66.09" fill="#47BF6A" width="20.64" height="20.64"/>
    <rect x="38.58" y="66.09" fill="#47BF6A" width="20.64" height="20.64"/>
    <rect x="65.24" y="66.09" fill="#47BF6A" width="20.64" height="20.64"/>
    <rect x="91.91" y="66.09" fill="#47BF6A" width="20.64" height="20.64"/>
    <rect x="11.91" y="91.55" fill="#47BF6A" width="20.64" height="20.64"/>
    <rect x="38.58" y="91.55" fill="#47BF6A" width="20.64" height="20.64"/>
    <rect x="65.24" y="91.55" fill="#47BF6A" width="20.64" height="20.64"/>
    <rect x="91.91" y="91.55" fill="#47BF6A" width="20.64" height="20.64"/>
    <rect x="11.91" y="116.91" fill="#47BF6A" width="20.64" height="20.64"/>
    <rect x="38.58" y="116.91" fill="#47BF6A" width="20.64" height="20.64"/>
    <rect x="65.24" y="116.91" fill="#47BF6A" width="20.64" height="20.64"/>
    <rect x="91.91" y="116.91" fill="#47BF6A" width="20.64" height="20.64"/>
    <rect x="118.09" y="40.63" fill="#47BF6A" width="20.64" height="20.64"/>
    <rect x="118.09" y="66.09" fill="#47BF6A" width="20.64" height="20.64"/>
    <rect x="118.09" y="91.55" fill="#47BF6A" width="20.64" height="20.64"/>
    <rect x="118.09" y="116.91" fill="#47BF6A" width="20.64" height="20.64"/>

    {/* Gray top bar */}
    <rect x="4.57" y="17.45" fill="#808285" width="141.58" height="16"/>

    {/* White text elements */}
    <g fill="#FFFFFF">
      <path d="M12.01,29.69V21.1h5.89v1.45h-4.15v2.03h3.59v1.45h-3.59v3.65H12.01z"/>
      <path d="M19.34,29.69V21.1h3.65c0.92,0,1.58,0.08,2,0.23s0.75,0.43,1,0.82s0.38,0.85,0.38,1.35c0,0.64-0.19,1.18-0.57,1.6s-0.95,0.68-1.7,0.79c0.38,0.22,0.68,0.46,0.93,0.72s0.57,0.73,0.99,1.39l1.05,1.68h-2.07l-1.25-1.87c-0.45-0.67-0.75-1.09-0.91-1.26s-0.34-0.29-0.52-0.36s-0.47-0.1-0.87-0.1h-0.35v3.59H19.34z M21.07,24.73h1.28c0.83,0,1.35-0.04,1.56-0.11s0.37-0.19,0.49-0.36s0.18-0.39,0.18-0.64c0-0.29-0.08-0.52-0.23-0.7s-0.37-0.29-0.65-0.34c-0.14-0.02-0.56-0.03-1.27-0.03h-1.35V24.73z"/>
      <path d="M28,29.69V21.1h6.37v1.45h-4.63v1.9h4.31v1.45h-4.31v2.34h4.8v1.45H28z"/>
      <path d="M36,29.69V21.1h6.37v1.45h-4.63v1.9h4.31v1.45h-4.31v2.34h4.8v1.45H36z"/>
    </g>
  </svg>
);

export default ScheduleFreeIcon;