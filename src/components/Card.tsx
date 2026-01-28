import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

/**
 * Card Component - Fintech XP Standard v3
 * Rounded corners, shadow, and consistent padding
 */
export const Card = ({ children, className = '', onClick }: CardProps) => {
    return (
        <div
            className={cn(
                'bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 transition-all hover:shadow-lg',
                className
            )}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export const CardHeader = ({ children, className = '' }: CardHeaderProps) => {
    return (
        <div className={cn('mb-4', className)}>
            {children}
        </div>
    );
};

interface CardTitleProps {
    children: React.ReactNode;
    className?: string;
}

export const CardTitle = ({ children, className = '' }: CardTitleProps) => {
    return (
        <h3 className={cn('text-lg md:text-xl font-semibold truncate min-w-0', className)}>
            {children}
        </h3>
    );
};

interface CardDescriptionProps {
    children: React.ReactNode;
    className?: string;
}

export const CardDescription = ({ children, className = '' }: CardDescriptionProps) => {
    return (
        <p className={cn('text-sm text-muted-foreground', className)}>
            {children}
        </p>
    );
};

interface CardContentProps {
    children: React.ReactNode;
    className?: string;
}

export const CardContent = ({ children, className = '' }: CardContentProps) => {
    return (
        <div className={className}>
            {children}
        </div>
    );
};

interface CardFooterProps {
    children: React.ReactNode;
    className?: string;
}

export const CardFooter = ({ children, className = '' }: CardFooterProps) => {
    return (
        <div className={cn('mt-4 pt-4 border-t border-gray-200 dark:border-gray-700', className)}>
            {children}
        </div>
    );
};
