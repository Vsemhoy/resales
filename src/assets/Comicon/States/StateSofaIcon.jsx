import React from 'react';

const StateSofaIcon = ({ height = '100%' }) => (
  <svg
    version="1.1"
    id="Capa_1"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 58 58"
    xmlSpace="preserve"
    style={{ enableBackground: 'new 0 0 58 58' }}
    width={height}
    height={height}
  >
    {/* Left armrest */}
    <path 
      fill="#D79B19" 
      d="M3.011,25.494c0.409,0.004,0.815,0.245,0.937,0.724l1.993,7.815C5.98,34.186,6,34.343,6,34.5l0,0
      l4.004-5L8,22.5L3.011,25.494z"
    />
    
    {/* Sofa seat */}
    <polygon 
      fill="#B37417" 
      points="52,34.5 6,34.5 10.004,29.5 48.004,29.5"
    />
    
    {/* Right cushion */}
    <path 
      fill="#E5AC20" 
      d="M48.004,29.5l1.996-7v-7.75c0-2.347-1.903-4.25-4.25-4.25h-12.5c-2.347,0-4.25,1.903-4.25,4.25V29.5
      H48.004z"
    />
    
    {/* Left cushion */}
    <path 
      fill="#F6C020" 
      d="M29.004,29.5V14.75c0-2.347-1.903-4.25-4.25-4.25h-12.5c-2.347,0-4.25,1.903-4.25,4.25v7.75l2,7
      H29.004z"
    />
    
    {/* Right armrest */}
    <path 
      fill="#D79B19" 
      d="M54.989,25.494c-0.409,0.004-0.815,0.245-0.937,0.724l-1.993,7.815C52.02,34.186,52,34.343,52,34.5
      l0,0l-3.996-5l1.996-7L54.989,25.494z"
    />
    
    {/* Left sofa leg */}
    <polygon 
      fill="#774836" 
      points="7,47.5 6,47.5 6,43.5 11,43.5"
    />
    
    {/* Right sofa leg */}
    <polygon 
      fill="#774836" 
      points="51,47.5 52,47.5 52,43.5 47,43.5"
    />
    
    {/* Left armrest details */}
    <path 
      fill="#FFC83E" 
      d="M5.941,34.033l-1.993-7.815c-0.247-0.968-1.649-0.968-1.896,0l-1.993,7.815
      c-0.078,0.307-0.078,0.628,0,0.934l1.993,7.815c0.129,0.505,0.572,0.74,1.002,0.718H6v-9l0,0C6,34.343,5.98,34.186,5.941,34.033z"
    />
    
    {/* Right armrest details */}
    <path 
      fill="#FFC83E" 
      d="M57.941,34.033l-1.993-7.815c-0.247-0.968-1.649-0.968-1.896,0l-1.993,7.815
      C52.02,34.186,52,34.343,52,34.5l0,0v9h2.946c0.43,0.022,0.873-0.213,1.002-0.718l1.993-7.815
      C58.02,34.66,58.02,34.34,57.941,34.033z"
    />
    
    {/* Sofa back */}
    <polygon 
      fill="#F5BE26" 
      points="52,34.5 6,34.5 6,34.5 6,43.5 52,43.5 52,34.5"
    />
  </svg>
);

export default StateSofaIcon;