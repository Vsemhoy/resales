import React from 'react';

const StateWaitIcon = ({ height = '100%' }) => (
  <svg
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width="800px"
    height="800px"
    viewBox="0 0 32 32"
    xmlSpace="preserve"
    style={{ enableBackground: 'new 0 0 32 32' }}
    width={height}
    height={height}
  >
    {/* Main hourglass shape */}
    <path 
      fill="#E1E5E5" 
      d="M27,5V2H5v3c0,5.391,3.881,9.868,9,10.81v0.381C8.881,17.132,5,21.609,5,27v3h22v-3
      c0-5.391-3.881-9.868-9-10.81V15.81C23.119,14.868,27,10.391,27,5z"
    />
    
    {/* Hourglass right side shading */}
    <path 
      fill="#C4CCCC" 
      d="M16,30h11v-3c0-5.391-3.881-9.868-9-10.81V15.81c5.119-0.942,9-5.418,9-10.81V2H16V30z"
    />
    
    {/* Hourglass center fill */}
    <path 
      fill="#FDFFFF" 
      d="M17,20c0-1.663,0-3.63,0-5.056c3.665-0.365,6.746-2.705,8.162-5.944C25.162,9,23,8,16,8
      S6.838,9,6.838,9c1.416,3.239,4.497,5.579,8.162,5.944c0,1.426,0,3.393,0,5.056c0,3-8,10-8,10h18C25,30,17,23,17,20z"
    />
    
    {/* Hourglass right side details */}
    <path 
      fill="#E1E5E5" 
      d="M25,30c0,0-8-7-8-10c0-1.663,0-3.63,0-5.056c3.665-0.365,6.746-2.705,8.162-5.944
      C25.162,9,23,8,16,8v22H25z"
    />
    
    {/* Top and bottom borders */}
    <rect x="4" fill="#A3AFAF" width="24" height="2"/>
    <rect x="4" y="30" fill="#A3AFAF" width="24" height="2"/>
    
    {/* Right side border accents */}
    <rect x="16" y="30" fill="#8D9999" width="12" height="2"/>
    <rect x="16" fill="#8D9999" width="12" height="2"/>
  </svg>
);

export default StateWaitIcon;