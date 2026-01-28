import React from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
    children: React.ReactNode;
    className?: string;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
};

export function PageContainer({ children, className, maxWidth = '2xl' }: PageContainerProps) {
    return (
        <div className={cn(
            'container mx-auto px-4 py-6',
            maxWidthClasses[maxWidth],
            className
        )}>
            {children}
        </div>
    );
}
