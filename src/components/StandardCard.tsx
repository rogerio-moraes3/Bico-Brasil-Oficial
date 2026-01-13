import React from 'react';

export default function StandardCard({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-md border border-[#E0E0E0] bg-white text-[#333333] shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
}
