import React from 'react';
import { Card } from '@/components/Card';
import { cn } from '@/lib/utils';

interface GridProps {
    children: React.ReactNode;
    columns?: 1 | 2 | 3 | 4;
    className?: string;
}

const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
};

export function Grid({ children, columns = 3, className }: GridProps) {
    return (
        <div className={cn(
            'grid gap-4',
            columnClasses[columns],
            className
        )}>
            {children}
        </div>
    );
}

interface GridItemProps {
    children: React.ReactNode;
    className?: string;
    asCard?: boolean;
}

export function GridItem({ children, className, asCard = true }: GridItemProps) {
    if (asCard) {
        return (
            <Card className={cn('transition-all hover:shadow-lg', className)}>
                {children}
            </Card>
        );
    }

    return <div className={className}>{children}</div>;
}
