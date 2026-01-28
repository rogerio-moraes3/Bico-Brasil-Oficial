import React from 'react';
import { cn } from '@/lib/utils';

interface SectionProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    description?: string;
}

export function Section({ children, className, title, description }: SectionProps) {
    return (
        <section className={cn('space-y-4', className)}>
            {(title || description) && (
                <div className="space-y-2">
                    {title && (
                        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
                    )}
                    {description && (
                        <p className="text-muted-foreground">{description}</p>
                    )}
                </div>
            )}
            {children}
        </section>
    );
}
