import React from 'react';

const StateAwaitedIcon = ({ height = '100%' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 768 768"
    style={{ enableBackground: 'new 0 0 768 768' }}
    width={height}
    height={height}
  >
    {/* Основной круг */}
    <circle 
      cx="384" 
      cy="384" 
      r="384" 
      fill="#73bfd8"
    />
    
    {/* Внутренний круг с обводкой */}
    <circle 
      cx="384" 
      cy="384" 
      r="344" 
      fill="#73bfd8"
      stroke="#eee"
      strokeWidth="24"
      strokeMiterlimit="32"
    />
    
    {/* Точки ожидания */}
    <circle cx="382.51" cy="384" r="68.33" fill="#fff" />
    <circle cx="193.48" cy="384" r="68.33" fill="#fff" />
    <circle cx="574.52" cy="384" r="68.33" fill="#fff" />
  </svg>
);

export default StateAwaitedIcon;