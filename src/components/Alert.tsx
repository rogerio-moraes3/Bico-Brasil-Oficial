import React from 'react';
import { Card } from '@/components/Card';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface AlertProps {
    children: React.ReactNode;
    variant?: 'info' | 'success' | 'warning' | 'error';
    className?: string;
}

const variantStyles = {
    info: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
    success: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
    warning: 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800',
    error: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
};

const variantIcons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle
};

const variantIconColors = {
    info: 'text-blue-600 dark:text-blue-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    error: 'text-red-600 dark:text-red-400'
};

export function Alert({ children, variant = 'info', className }: AlertProps) {
    const Icon = variantIcons[variant];

    return (
        <Card className={cn(
            'border-l-4',
            variantStyles[variant],
            className
        )}>
            <div className="flex gap-3">
                <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', variantIconColors[variant])} />
                <div className="flex-1">{children}</div>
            </div>
        </Card>
    );
}
