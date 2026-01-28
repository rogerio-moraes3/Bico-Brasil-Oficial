import React from 'react';
import { Card } from '@/components/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
    title: string;
    message: string;
    timestamp: Date;
    read?: boolean;
    avatar?: string;
    onClick?: () => void;
    className?: string;
}

export function NotificationItem({
    title,
    message,
    timestamp,
    read = false,
    avatar,
    onClick,
    className
}: NotificationItemProps) {
    return (
        <Card
            className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                !read && 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
                className
            )}
            onClick={onClick}
        >
            <div className="flex gap-3">
                {avatar && (
                    <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={avatar} />
                        <AvatarFallback>{title[0]}</AvatarFallback>
                    </Avatar>
                )}
                <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm truncate">{title}</h4>
                        {!read && (
                            <div className="h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{message}</p>
                    <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(timestamp, { addSuffix: true, locale: ptBR })}
                    </p>
                </div>
            </div>
        </Card>
    );
}
