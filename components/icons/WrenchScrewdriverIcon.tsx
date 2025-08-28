
import React from 'react';

const WrenchScrewdriverIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.528-1.04 1.528-2.04 2.828-2.828.996-.608 2.296-.608 3.292 0l2.496 2.496c.996.996.996 2.296 0 3.292-.788.788-1.788 1.288-2.828 1.816l-3.03 2.496m-11.42-15.17L13 9.75M3.375 21l6.375-6.375" />
  </svg>
);

export default WrenchScrewdriverIcon;
