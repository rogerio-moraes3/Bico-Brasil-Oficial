import React from 'react';

export default function StandardCard({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-md border border-border bg-card text-card-foreground shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
}
