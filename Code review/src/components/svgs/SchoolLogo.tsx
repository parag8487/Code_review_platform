import React from 'react';

const SchoolLogo = ({ className }: { className?: string }) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className}>
    <title>School</title>
    <path d="M12 3 1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3z" fill="currentColor"/>
    <path d="M12 5.28 18.82 9 12 12.72 5.18 9 12 5.28z" fill="currentColor"/>
    <rect x="5" y="11" width="4" height="4" fill="currentColor"/>
    <rect x="11" y="11" width="4" height="4" fill="currentColor"/>
    <rect x="15" y="13" width="2" height="2" fill="currentColor"/>
  </svg>
);

export default SchoolLogo;