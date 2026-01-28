import React from 'react';
import { Card } from '@/components/Card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    icon?: React.ReactNode;
    className?: string;
}

export function StatsCard({
    title,
    value,
    description,
    trend,
    trendValue,
    icon,
    className
}: StatsCardProps) {
    const trendColors = {
        up: 'text-green-600 bg-green-50 dark:bg-green-950',
        down: 'text-red-600 bg-red-50 dark:bg-red-950',
        neutral: 'text-gray-600 bg-gray-50 dark:bg-gray-950'
    };

    return (
        <Card className={cn('transition-all hover:shadow-lg', className)}>
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    {icon && <div className="text-muted-foreground">{icon}</div>}
                </div>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold">{value}</h3>
                    {trend && trendValue && (
                        <Badge className={cn('text-xs', trendColors[trend])}>
                            {trendValue}
                        </Badge>
                    )}
                </div>
                {description && (
                    <p className="text-xs text-muted-foreground">{description}</p>
                )}
            </div>
        </Card>
    );
}
