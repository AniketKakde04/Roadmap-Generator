import React from 'react';

const LightBulbIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-11.649.5.5 0 00.32-1.229 9.75 9.75 0 00-9.66 0c.19.9.62 1.631 1.229 2.148A6.006 6.006 0 0012 12.75zm0 0h-2.58m2.58 0A2.25 2.25 0 1114.25 15H9.75A2.25 2.25 0 1112 12.75zm0 0V6" />
    </svg>
);

export default LightBulbIcon;
