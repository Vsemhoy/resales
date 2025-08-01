import React from 'react';

const StateComputerIcon = ({ height = '100%' }) => (
  <svg
    version="1.1"
    id="Layer_1"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 501.333 501.333"
    xmlSpace="preserve"
    style={{ enableBackground: 'new 0 0 501.333 501.333' }}
    width={height}
    height={height}
  >
    {/* Monitor frame */}
    <path 
      fill="#637888" 
      d="M458.667,241.067c0,11.733-8.533,21.333-20.267,21.333H62.933c-10.667,0-20.267-9.6-20.267-21.333
      V21.333C42.667,9.6,51.2,0,62.933,0H438.4c10.667,0,20.267,9.6,20.267,21.333L458.667,241.067L458.667,241.067z"
    />
    
    {/* Monitor screen */}
    <path 
      fill="#53C2EF" 
      d="M62.933,249.6c-5.333,0-8.533-4.267-8.533-9.6V21.333c0-5.333,4.267-9.6,8.533-9.6H438.4
      c5.333,0,8.533,4.267,8.533,9.6v219.733c0,5.333-4.267,9.6-8.533,9.6H62.933V249.6z"
    />
    
    {/* Keyboard top */}
    <rect 
      x="166.4" 
      y="262.4" 
      fill="#3A5569" 
      width="168.533" 
      height="61.867"
    />
    
    {/* Keyboard base */}
    <path 
      fill="#637888" 
      d="M363.733,317.867H137.6c-18.133,0-34.133,10.667-34.133,23.467h294.4
      C397.867,328.533,382.933,317.867,363.733,317.867z"
    />
    
    {/* Desk surface */}
    <rect 
      y="342.4" 
      fill="#3A5569" 
      width="501.333" 
      height="158.933"
    />
    
    {/* Desk details */}
    <g>
      <rect 
        x="268.8" 
        y="375.467" 
        fill="#637888" 
        width="194.133" 
        height="45.867"
      />
      <rect 
        x="28.8" 
        y="364.8" 
        fill="#637888" 
        width="11.733" 
        height="113.067"
      />
      <rect 
        x="60.8" 
        y="364.8" 
        fill="#637888" 
        width="11.733" 
        height="113.067"
      />
      <rect 
        x="91.733" 
        y="364.8" 
        fill="#637888" 
        width="11.733" 
        height="113.067"
      />
      <rect 
        x="122.667" 
        y="364.8" 
        fill="#637888" 
        width="11.733" 
        height="113.067"
      />
      <rect 
        x="153.6" 
        y="364.8" 
        fill="#637888" 
        width="11.733" 
        height="113.067"
      />
    </g>
    
    {/* Status lights */}
    <circle 
      fill="#F16D6E" 
      cx="225.067" 
      cy="400" 
      r="11.733"
    />
    <circle 
      fill="#60C3AB" 
      cx="225.067" 
      cy="443.733" 
      r="11.733"
    />
  </svg>
);

export default StateComputerIcon;