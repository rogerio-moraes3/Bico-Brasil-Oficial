import React from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export function EmptyState({
    title,
    description,
    icon,
    action,
    className
}: EmptyStateProps) {
    return (
        <Card className={cn('text-center py-12', className)}>
            <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
                {icon && (
                    <div className="text-muted-foreground opacity-50">
                        {icon}
                    </div>
                )}
                <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{title}</h3>
                    {description && (
                        <p className="text-sm text-muted-foreground">{description}</p>
                    )}
                </div>
                {action && (
                    <Button onClick={action.onClick}>
                        {action.label}
                    </Button>
                )}
            </div>
        </Card>
    );
}
