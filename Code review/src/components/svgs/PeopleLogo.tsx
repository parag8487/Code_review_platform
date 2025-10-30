import React from 'react';

const PeopleLogo = ({ className }: { className?: string }) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className}>
    <title>Collabration</title>
    {/* First person */}
    <circle cx="7" cy="7" r="3" fill="currentColor"/>
    <path d="M7 12c-2 0-4 1-4 3v2h8v-2c0-2-2-3-4-3z" fill="currentColor"/>
    {/* Second person */}
    <circle cx="17" cy="7" r="3" fill="currentColor"/>
    <path d="M17 12c-2 0-4 1-4 3v2h8v-2c0-2-2-3-4-3z" fill="currentColor"/>
  </svg>
);

export default PeopleLogo;